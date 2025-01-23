
import * as t from '@babel/types';
import CONSTANTS from '../constants';
import { getClassDestructor } from '../helperFunctions/classHelperFunctions';
import { LeakFactorStats } from '../../LeakFactorStats';
import { getAssignedIdentifier, getNewIdentifier, isSpecifierImported, replaceWithAssignmentStatement } from '../helperFunctions/utils';

const unregisterUrlChangeListener = (listenerCallPath, classDecPath, destructorBody) => {
    let unlistenerReference = null;

    if (listenerCallPath.findParent((parentPath) => parentPath.isLoop()
        || (parentPath.isCallExpression() && parentPath.node.callee.property?.name === 'forEach'))) {
            // TODO: Handle listeners added in loop, using array push
    } else {
        const returnedFunctionID = getNewIdentifier(classDecPath, 'onUrlChangeListener');
        const returnedFunctionIDDeclaration = t.classProperty(returnedFunctionID, null, t.typeAnnotation(t.anyTypeAnnotation()));
        classDecPath.get('body').unshiftContainer('body', returnedFunctionIDDeclaration);
        unlistenerReference = t.memberExpression(t.thisExpression(), returnedFunctionID);

        const listenerAssignmentData = {
            id: unlistenerReference,
            assignmentExpression: t.assignmentExpression('=', unlistenerReference, listenerCallPath.node)
        };

        replaceWithAssignmentStatement(listenerCallPath, listenerAssignmentData);
    }

    const unregisterListenerStatement = t.expressionStatement(t.callExpression(unlistenerReference, []));
    destructorBody.push(unregisterListenerStatement);
};

export const fixUrlChangeListenerLeaksInClass = (programPath, currentFramework, classDecPath) => {
    if (currentFramework !== CONSTANTS.FRAMEWORKS.ANGULAR) {
        return;
    }

    if (!hasUrlChangeListeners(programPath, classDecPath)) {
        return;
    }

    const unRegisteredUrlChangeListeners = getRegisteredURLChangeListeners(classDecPath);

    if (unRegisteredUrlChangeListeners.length) {
        const { destructorBody } = getClassDestructor(programPath, classDecPath, currentFramework);

        unRegisteredUrlChangeListeners.forEach((urlChangeListener) => {
            unregisterUrlChangeListener(urlChangeListener, classDecPath, destructorBody);
        });
    }
};

const hasUrlChangeListeners = (programPath, classDecPath) => {
    let hasUrlChangeEventListeners = false;
    const isLocationImported = isSpecifierImported(programPath, 'Location', '@angular/common');

    if (!isLocationImported) {
        return false;
    }

    classDecPath.traverse({
        'CallExpression|OptionalCallExpression'(callPath) {
            if (isOnUrlChangeListener(callPath)) {
                hasUrlChangeEventListeners = true;
                callPath.stop();
            }
        }
    });

    return hasUrlChangeEventListeners;
};

const isOnUrlChangeListener = (callPath) => {
    const { callee } = callPath.node;
    return t.isMemberExpression(callee) && callee.property.name === 'onUrlChange';
};

const getRegisteredURLChangeListeners = (classDecPath) => {
    const registeredUrlChangeListeners = [];

    classDecPath.traverse({
        CallExpression(callPath) {
            if (isOnUrlChangeListener(callPath)) {
                const assignedIdentifier = getAssignedIdentifier(callPath);

                if (!assignedIdentifier) {
                    registeredUrlChangeListeners.push(callPath);
                }
            }
        }
    });

    // TODO: Handle listeners as argument of call expression (check if later unlistened)

    return registeredUrlChangeListeners;
};
