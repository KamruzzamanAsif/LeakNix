import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import CONSTANTS from '../constants';
import { getUnDisposedListeners, hasRendererListeners } from '../helperFunctions/trackRendererListeners';
import { getClassDestructor } from '../helperFunctions/classHelperFunctions';

const disposeListeners = (listenerCallPath, classDecPath, destructorPath, destructorBody) => {
    // const returnedFunctionID = getNewIdentifier(classDecPath, 'onUrlChangeListener');
    // const returnedFunctionIDDeclaration = t.classProperty(returnedFunctionID, null, t.typeAnnotation(t.anyTypeAnnotation()));
    // classDecPath.get('body').unshiftContainer('body', returnedFunctionIDDeclaration);
    // const returnedFunctionIDReference = t.memberExpression(t.thisExpression(), returnedFunctionID);

    // const listenerAssignmentData = {
    //     id: returnedFunctionIDReference,
    //     assignmentExpression: t.assignmentExpression('=', returnedFunctionIDReference, listenerCallPath.node)
    // };

    // replaceWithAssignmentStatement(listenerCallPath, listenerAssignmentData);

    // const unregisterListenerStatement = t.expressionStatement(t.callExpression(returnedFunctionIDReference, []));
    // destructorBody.push(unregisterListenerStatement);
};

const disposeListenersCollection = (collector, destructorMethodPath) => {
    let unsubscribeStatement = null;

    if (collector.type === CONSTANTS.TYPES.ARRAY) {
        unsubscribeStatement = template({ plugins: [CONSTANTS.TYPESCRIPT] }).ast(`
            this.${collector.name}.forEach((subscription: Subscription) => {
                subscription.unsubscribe();
            })`);
    }

    destructorMethodPath.get('body').unshiftContainer('body', unsubscribeStatement);
};

export const fixRendererListenerLeaksInClass = (programPath, currentFramework, classDecPath, pluginOptions) => {
    if (currentFramework !== CONSTANTS.FRAMEWORKS.ANGULAR) {
        return;
    }

    if (!hasRendererListeners(programPath, classDecPath.get('body.0'), classDecPath.node.id?.name)) {
        return;
    }

    const classBodyPath = classDecPath.get('body');
    const { destructorPath } = getClassDestructor(programPath, classDecPath, currentFramework);
    const { undisposedListeners, undisposedlistenerCollections } = getUnDisposedListeners(classBodyPath, destructorPath, classDecPath.node.id?.name);

    // undisposedListeners.length && disposeListeners(programPath, classBodyPath, undisposedListeners, destructorPath);
    undisposedlistenerCollections?.forEach((collector) => {
        // disposeListenersCollection(collector, destructorPath);

        // if (!isListenerDisposed(collector, destructorPath)) {
        // }
    });

    // if (unReleasedSubscriptions.length + unreleasedSubscriptionCollectors.length) {
    //     LeakFactorStats.addFilesRefactoredForSubscriptionLeak(pluginOptions.fileName);
    //     LeakFactorStats.addSubscriptionLeaksCount(unReleasedSubscriptions.length + unreleasedSubscriptionCollectors.length);
    // }
};
