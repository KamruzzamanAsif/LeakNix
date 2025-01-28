/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import generate from '@babel/generator';
import * as t from '@babel/types';
import CONSTANTS from '../constants';
import { getAssignedIdentifier} from './utils';
import { isInsideNestedFunctionInNamelessClass } from './classHelperFunctions';
import { getFunctionName } from './functionalComponentHelpers';

class SubscriptionCollector {
    static unReleasedSubscriptions = [];
    static unreleasedSubscriptionCollectors = [];
}

export const hasSubscriptions = (containerPath, className) => {
    let hasSubscriptions = false;

    containerPath.traverse({
        'CallExpression|OptionalCallExpression'(callPath) {
            if (isSubscription(callPath, containerPath, className)) {
                hasSubscriptions = true;
                // eslint-disable-next-line no-useless-return
                callPath.stop();
            }
        },
    });

    return hasSubscriptions;
};

const isSubscription = (subscribeCallPath, classPath, className) => {
    // Ignoring subscriptions in nested functions in nameless classes
    if (isInsideNestedFunctionInNamelessClass(CONSTANTS.CONTAINER_TYPES.CLASS, className, subscribeCallPath)) {
        return false;
    }

    // Ignore Returned subscriptions; if a subscription is returned, currently is very complicated to detect where the returned value is used (& cleared)
    if (t.isReturnStatement(subscribeCallPath.parent)) {
        return false;
    }

    const subscriptionObject = subscribeCallPath.node.callee.object;
    if (t.isThisExpression(subscriptionObject) || generate(subscriptionObject).code === className) {
        return false;
    }

    if ((subscribeCallPath.node.callee.property?.name === CONSTANTS.METHOD_NAMES.SUBSCRIBE)
        && (generate(subscribeCallPath.node.callee).code.startsWith('this.') || generate(subscribeCallPath.node.callee).code === className)) {
        let needToUnsubscribe = true;

        const calleePath = subscribeCallPath.get('callee');
        let classPropertyInSubscriptionCall = null;

        calleePath.traverse({
            MemberExpression(memberExpressionPath) {
                const { node } = memberExpressionPath;

                if ((t.isThisExpression(node.object) || generate(node.object).code === className)
                && t.isIdentifier(node.property)) {
                    classPropertyInSubscriptionCall = node.property;
                }
            }
        });

        classPath.traverse({
            ClassProperty(propertyPath) {
                if (propertyPath.node.key.name === classPropertyInSubscriptionCall.name) {
                    const propertyType = propertyPath.node.typeAnnotation?.typeAnnotation;

                    if (propertyType && (!generate(propertyType).code.startsWith('Observable')
                        || t.isIdentifier(propertyType, { name: 'ActivatedRoute' }))) {
                        needToUnsubscribe = false;
                        propertyPath.stop();
                    }
                }
            },
            ClassMethod(classMethodPath) {
                const { node } = classMethodPath;

                if (node.kind === 'constructor') {
                    const parameterProperty = node.params.find((parameterProperty) => {
                        return parameterProperty.parameter?.name === classPropertyInSubscriptionCall?.name;
                    });

                    const propertyType = parameterProperty && parameterProperty.parameter.typeAnnotation?.typeAnnotation;

                    if (propertyType && (!generate(propertyType).code.startsWith('Observable')
                        || t.isIdentifier(propertyType, { name: 'ActivatedRoute' }))) {
                        needToUnsubscribe = false;
                    }
                }
            }
        });

        return needToUnsubscribe;
    }

    return false;
};

export const isSubscriptionUnsubscribed = (classPath, subscription, destructorMethodPath, destructorMethodName) => {
    let isUnsubscribed = false;
     const checkedMethods = [];

    const checkForUnsubscriptionInMethod = (methodPath) => {
        methodPath.traverse({
            'CallExpression|OptionalCallExpression'(callPath) {
                const { node } = callPath;

                if (generate(node.callee).code.includes(subscription.name)) {
                    if ((subscription.type === 'takeUntilObservable') && (node.callee.property?.name === 'next')) {
                        isUnsubscribed = true;
                        destructorMethodPath.stop();
                    }

                    if (subscription.type === CONSTANTS.TYPES.SUBSCRIPTION_OBJECT && node.callee.property?.name === CONSTANTS.METHOD_NAMES.UNSUBSCRIBE) {
                        isUnsubscribed = true;
                        destructorMethodPath.stop();
                    }
                } else {
                    // Checking for unsubscriptions in nested methods
                    const methodCalledInDestructor = generate(callPath.node.callee.property ? callPath.node.callee.property : callPath.node.callee).code;

                    // Method callee, but is not for unsubscribing
                    if (methodCalledInDestructor !== destructorMethodName && !checkedMethods.includes(methodCalledInDestructor)) {
                        searchForMethod(methodCalledInDestructor);
                    }
                }
            },
            'MemberExpression|OptionalMemberExpression'(memberPath) {
                if ((subscription.type === CONSTANTS.TYPES.ARRAY || subscription.type === CONSTANTS.TYPES.SUBSCRIPTION_OBJECT)
                    && generate(memberPath.node).code.includes(subscription.name)) {
                        isUnsubscribed = true;
                        destructorMethodPath.stop();
                }
            }
        });
    };

    const searchForMethod = (methodNameToMatch) => {
        const checkForMethodCall = (currentMethodPath, currentMethodName) => {
            if (currentMethodName === methodNameToMatch) {
                // method call found that does not contain subscription name in its callee, so check its internals
                checkedMethods.push(currentMethodName);

                const methodPath = currentMethodPath.isVariableDeclarator() ? currentMethodPath.get('init') : currentMethodPath;
                checkForUnsubscriptionInMethod(methodPath);
            }
        };

        classPath.traverse({
            FunctionDeclaration(functionPath) {
                getFunctionName(functionPath) && checkForMethodCall(functionPath, getFunctionName(functionPath));
            },
            ClassMethod(classMethodPath) {
                checkForMethodCall(classMethodPath, classMethodPath.node.key.name);
            },
            VariableDeclarator(varDeclarationPath) {
                checkForMethodCall(varDeclarationPath, varDeclarationPath.node.id.name);
            }
        });
    };

    checkForUnsubscriptionInMethod(destructorMethodPath);

    return isUnsubscribed;
};

const CheckForSubscriptionHandlingByTakeUntil = (subscriptionCallPath) => {
    const subscriptionData = {
        takeUntilNotUsed: true
    };

    const getIndextoInsertTakeUntil = (pipedOperators) => {
        let insertAtIndex = null;

        for (let index = pipedOperators.length - 1; index >= 0; index--) {
            const operator = pipedOperators[index];
            if (t.isCallExpression(operator) && ['count', 'toArray', 'shareReplay', 'finalize'].includes(operator.callee.name)) {
                insertAtIndex = index;
            } else {
                break;
            }
        }

        return insertAtIndex;
    };

    subscriptionCallPath.get('callee').traverse({
        'CallExpression|OptionalCallExpression'(takeUntilCallPath) {
            if (takeUntilCallPath.node?.name?.includes(CONSTANTS.METHOD_NAMES.TAKE_UNTIL)
                || takeUntilCallPath.node.callee?.name?.includes(CONSTANTS.METHOD_NAMES.TAKE_UNTIL)
                || takeUntilCallPath.node.callee?.property?.name?.includes(CONSTANTS.METHOD_NAMES.TAKE_UNTIL
            )) {
                subscriptionData.takeUntilNotUsed = false;
                const takeUntilPipePath = takeUntilCallPath.findParent((parentPath) => {
                    return (parentPath.node.callee?.property?.name === 'pipe' || parentPath.node.callee?.name === 'pipe')
                    && parentPath.node.arguments.find((operator) => operator.callee?.name === CONSTANTS.METHOD_NAMES.TAKE_UNTIL);
                });

                if (takeUntilPipePath) {
                    const pipedOperators = takeUntilPipePath.node.arguments;
                    const lastOperator = pipedOperators[pipedOperators.length - 1];

                    if (![CONSTANTS.METHOD_NAMES.TAKE_UNTIL, 'count', 'toArray', 'shareReplay', 'finalize'].includes(lastOperator?.callee.name)) {
                        subscriptionData.pipedOperatorsToReorder = pipedOperators;
                        subscriptionData.currentTakeUntilIndex = pipedOperators.findIndex((operator) => operator.callee?.name === CONSTANTS.METHOD_NAMES.TAKE_UNTIL);
                        const insertAtIndex = getIndextoInsertTakeUntil(pipedOperators);

                        if (insertAtIndex) {
                            subscriptionData.updatedTakeUntilIndex = insertAtIndex;
                        }
                    }
                }
            }
        }
    });

    if (subscriptionData.takeUntilNotUsed) {
        const calleeObject = subscriptionCallPath.node.callee.object;

        if (t.isCallExpression(calleeObject) && (calleeObject.callee?.name === 'pipe' || calleeObject.callee?.property?.name === 'pipe')) {
            const pipedOperators = calleeObject.arguments;
            subscriptionData.pipedOperators = pipedOperators;
            subscriptionData.addTakeUntilInExistingPipe = true;

            subscriptionData.insertAtIndex = getIndextoInsertTakeUntil(pipedOperators);
        }
    }

    if (subscriptionData.takeUntilNotUsed || subscriptionData.pipedOperatorsToReorder) {
        SubscriptionCollector.unReleasedSubscriptions.push({
            subscriptionCallPath,
            ...subscriptionData
        });
    }
};

export const getUnReleasedSubscriptions = (containerPath, destructorMethodPath, className) => {
    SubscriptionCollector.unReleasedSubscriptions = [];
    SubscriptionCollector.unreleasedSubscriptionCollectors = [];

    containerPath.traverse({
        'CallExpression|OptionalCallExpression'(path) {
            if (!isSubscription(path, containerPath, className)) {
                return;
            }

            const subscriptionCallPath = path;
            const assignedID = getAssignedIdentifier(subscriptionCallPath);
            const add = CONSTANTS.COLLECTION_METHOD_NAMES.ADD;
            const push = CONSTANTS.COLLECTION_METHOD_NAMES.PUSH;

            if (assignedID) {
                // If subscription object is stored
                const assignedIDString = generate(assignedID).code;
                let subscriptionsCollectorCallee = null;

                containerPath.traverse({
                    'CallExpression|OptionalCallExpression'(callPath) {
                        if (generate(callPath.node.arguments[0]).code === assignedIDString
                            && (callPath.node.callee.property?.name === add || callPath.node.callee.property?.name === push)
                            && (generate(callPath.node).code.startsWith('this.') || generate(callPath.node).code.startsWith(className))
                            && !callPath.node.callee.computed) {
                            subscriptionsCollectorCallee = callPath.node.callee;
                        }
                    }
                });

                if (subscriptionsCollectorCallee) {
                    const subscriptionCollector = {
                        name: generate(subscriptionsCollectorCallee.object).code,
                        type: subscriptionsCollectorCallee.property?.name === push ? CONSTANTS.TYPES.ARRAY : CONSTANTS.TYPES.SUBSCRIPTION_OBJECT
                    };

                    if (!isSubscriptionUnsubscribed(containerPath, subscriptionCollector, destructorMethodPath)) {
                        SubscriptionCollector.unreleasedSubscriptionCollectors.push(subscriptionCollector);
                    } else {
                        CheckForSubscriptionHandlingByTakeUntil(subscriptionCallPath);
                    }
                } else {
                    if (assignedID.computed) {
                        CheckForSubscriptionHandlingByTakeUntil(subscriptionCallPath);
                    } else {
                        const subscriptionCollector = {
                            name: assignedIDString,
                            type: CONSTANTS.TYPES.SUBSCRIPTION_OBJECT
                        };

                        if (!isSubscriptionUnsubscribed(containerPath, subscriptionCollector, destructorMethodPath)) {
                            if (assignedIDString.startsWith('this.') || assignedIDString.startsWith(className)) {
                                SubscriptionCollector.unreleasedSubscriptionCollectors.push(subscriptionCollector);
                            } else {
                                CheckForSubscriptionHandlingByTakeUntil(subscriptionCallPath);
                            }
                        }
                    }
                }
            } else {
                // if direct call or compued assignment var
                if (t.isCallExpression(subscriptionCallPath.parent)) {
                    const parentCallee = subscriptionCallPath.parent.callee;
                    // check if added in collection
                    if ((parentCallee.property?.name === add || parentCallee.property?.name === push)
                        && (generate(parentCallee).code.startsWith('this.') || generate(parentCallee.node).code.startsWith(className))) {
                            const subscriptionCollector = {
                            name: generate(parentCallee.object).code,
                            type: parentCallee.property?.name === push ? CONSTANTS.TYPES.ARRAY : CONSTANTS.TYPES.SUBSCRIPTION_OBJECT
                        };

                        // if yes, check if collection is unsubscribed
                        if (!isSubscriptionUnsubscribed(containerPath, subscriptionCollector, destructorMethodPath)
                            && !SubscriptionCollector.unreleasedSubscriptionCollectors.find((collector) => collector.name === subscriptionCollector.name)) {
                            SubscriptionCollector.unreleasedSubscriptionCollectors.push(subscriptionCollector);
                        }
                    }
                } else {
                    CheckForSubscriptionHandlingByTakeUntil(subscriptionCallPath);
                }
            }
        }
    });

    const { unReleasedSubscriptions, unreleasedSubscriptionCollectors } = SubscriptionCollector;
    return { unReleasedSubscriptions, unreleasedSubscriptionCollectors };
};
