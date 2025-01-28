import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import CONSTANTS from '../constants';
import { getUnReleasedSubscriptions, hasSubscriptions, isSubscriptionUnsubscribed } from '../helperFunctions/trackSubscriptions';
import { getClassDestructor } from '../helperFunctions/classHelperFunctions';
import { getDestroyerSubject, importSpecifierFromSource, isSpecifierImported } from '../helperFunctions/utils';
import { LeakFactorStats } from '../../LeakFactorStats';

const releaseSubscriptions = (programPath, classBodyPath, subscriptions, destructorMethodPath) => {
    subscriptions.forEach((subscription) => {
        if (subscription.takeUntilNotUsed) {
            // 1. Ensure Subject is imported
            const isTakeUntilImported = isSpecifierImported(programPath, CONSTANTS.IMPORTED_SPECIFIERS.TAKE_UNTIL, CONSTANTS.IMPORT_SOURCES.RXJS);
            const isSubjectImported = isSpecifierImported(programPath, CONSTANTS.TYPES.SUBJECT_OBSERVABLE, CONSTANTS.IMPORT_SOURCES.RXJS);

            if (!isTakeUntilImported) {
                importSpecifierFromSource(programPath, 'rxjs/operators', CONSTANTS.IMPORTED_SPECIFIERS.TAKE_UNTIL, CONSTANTS.IMPORT_KINDS.VALUE);
            }

            if (!isSubjectImported) {
                importSpecifierFromSource(programPath, CONSTANTS.IMPORT_SOURCES.RXJS, CONSTANTS.TYPES.SUBJECT_OBSERVABLE, CONSTANTS.IMPORT_KINDS.VALUE);
            }

            // 2. Create destroyer subject (if not already exist)
            const { subjectIdentifier, emitterType } = getDestroyerSubject(classBodyPath);

            // 3. Add takeuntil call before subscribe call
            const takeUntilMethodCall = t.callExpression(t.identifier(CONSTANTS.METHOD_NAMES.TAKE_UNTIL), [t.identifier(`this.${subjectIdentifier.name}`)]);

            if (subscription.addTakeUntilInExistingPipe) {
                if (subscription.insertAtIndex || subscription.insertAtIndex === 0) {
                    subscription.pipedOperators.splice(subscription.addAtIndex, 0, takeUntilMethodCall);
                } else {
                    subscription.pipedOperators.push(takeUntilMethodCall);
                }
            } else {
                const subscribeMethodCalleeObject = subscription.subscriptionCallPath.node.callee.object;
                let subscribeCallObjectPath = null;

                if (t.isIdentifier(subscribeMethodCalleeObject)) {
                    subscription.subscriptionCallPath.traverse({
                        Identifier(identifierPath) {
                            if (generate(subscribeMethodCalleeObject).code === generate(identifierPath.node).code) {
                                subscribeCallObjectPath = identifierPath;
                                identifierPath.stop();
                            }
                        }
                    });
                } else {
                    subscription.subscriptionCallPath.traverse({
                        Expression(expressionPath) {
                            if (generate(subscribeMethodCalleeObject).code.includes(generate(expressionPath.node).code) && subscribeMethodCalleeObject?.start === expressionPath.node?.start) {
                                subscribeCallObjectPath = expressionPath;
                                expressionPath.stop();
                            }
                        }
                    });
                }

                const updatedSubscribeObject = t.memberExpression(subscribeMethodCalleeObject, t.identifier('pipe'));
                const updatedSubscribeObjectCall = t.callExpression(updatedSubscribeObject, [takeUntilMethodCall]);

                subscribeCallObjectPath.replaceWith(updatedSubscribeObjectCall);
            }

            // 4.Complete the subject observable by emitting in destructor (if not already)
            unsubscribeSubscriptionCollector({
                name: `this.${subjectIdentifier.name}`,
                type: CONSTANTS.TYPES.TAKE_UNTIL_OBSERVABLE,
                emitterType
            }, destructorMethodPath);
        }

        if (subscription.pipedOperatorsToReorder) {
            const takeUntilOperator = subscription.pipedOperatorsToReorder.splice(subscription.currentTakeUntilIndex, 1)[0];

            if (subscription.updatedTakeUntilIndex) {
                subscription.pipedOperatorsToReorder.splice(subscription.updatedTakeUntilIndex, 0, takeUntilOperator);
            } else {
                subscription.pipedOperatorsToReorder.push(takeUntilOperator);
            }
        }
    });
};

const unsubscribeSubscriptionCollector = (collector, destructorMethodPath) => {
    let unsubscribeStatement = null;

    if (collector.type === CONSTANTS.TYPES.ARRAY) {
        unsubscribeStatement = template({ plugins: [CONSTANTS.TYPESCRIPT] }).ast(`
            ${collector.name}.forEach((subscription: Subscription) => {
                subscription?.unsubscribe();
            })`);
    } else if (collector.type === CONSTANTS.TYPES.TAKE_UNTIL_OBSERVABLE) {
        let observableCompleted = false;

        destructorMethodPath.traverse({
            'CallExpression|OptionalCallExpression'(callExpPath) {
                if (callExpPath.node.callee.property?.name === 'next'
                    && generate(callExpPath.node.callee.object).code === collector.name) {
                    observableCompleted = true;
                    destructorMethodPath.stop();
                }
            }
        });

        if (!observableCompleted) {
            unsubscribeStatement = (collector.emitterType === 'boolean' || collector.emitterType === 'any') ? (
                template.ast`
                    ${collector.name}.next(true);
                    ${collector.name}.complete();
                `) : (
                template.ast`
                    ${collector.name}.next();
                    ${collector.name}.complete();
                `);
        }
    } else {
        unsubscribeStatement = template.ast`${collector.name}?.unsubscribe()`;
    }

    destructorMethodPath.get('body').unshiftContainer('body', unsubscribeStatement);
};

export const fixSubscriptionLeaksInClass = (programPath, currentFramework, classDecPath, pluginOptions) => {
    if (currentFramework !== CONSTANTS.FRAMEWORKS.ANGULAR) {
        return;
    }

    if (!hasSubscriptions(classDecPath.get('body'), classDecPath.node.id?.name)) {
        return;
    }

    const classBodyPath = classDecPath.get('body');
    const { destructorPath } = getClassDestructor(programPath, classDecPath, currentFramework);
    const { unReleasedSubscriptions, unreleasedSubscriptionCollectors } = getUnReleasedSubscriptions(classBodyPath, destructorPath, classDecPath.node.id?.name);

    unReleasedSubscriptions.length && releaseSubscriptions(programPath, classBodyPath, unReleasedSubscriptions, destructorPath);

    // If no unsubscribed subscriptions exist, but existing collector exists and is not cleared, clear array collector with foreach and object collector with direct unsubscribe
    unreleasedSubscriptionCollectors?.forEach((collector) => {
        if (!isSubscriptionUnsubscribed(classDecPath, collector, destructorPath)) {
            unsubscribeSubscriptionCollector(collector, destructorPath);
        }
    });

    if (unReleasedSubscriptions.length || unreleasedSubscriptionCollectors.length) {
        LeakFactorStats.addFilesRefactoredForSubscriptionLeak(pluginOptions.fileName);
        LeakFactorStats.addSubscriptionLeaksCount(unReleasedSubscriptions.length + unreleasedSubscriptionCollectors.length);
    }
};
