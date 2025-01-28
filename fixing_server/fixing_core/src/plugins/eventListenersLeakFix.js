/* eslint-disable no-restricted-syntax */
import template from '@babel/template';
import * as t from '@babel/types';
import generate from '@babel/generator';
import CONSTANTS from '../constants';
import { getFunctionalComponentDestructor, getParentUseEffectPath, getReturnFunctionBlockInUseEffect } from '../helperFunctions/functionalComponentHelpers';
import { getUnRemovedListeners, hasListeners } from '../helperFunctions/trackEventListeners';
import { getClassDestructor, isReactClass } from '../helperFunctions/classHelperFunctions';
import { LeakFactorStats } from '../../LeakFactorStats';
import { removeListeneUsingAbortController } from '../helperFunctions/abortController';
import { canBeRemovedUsingRemoveEventListener } from '../helperFunctions/utils';

const removeListeners = (unRemovedListeners, containerPath, containerType, destructorBody, className, isTypescript) => {
    for (const unRemovedListener of unRemovedListeners) {
        let removeListenerStatement = null;
        const isClassComponent = (containerType === CONSTANTS.CONTAINER_TYPES.CLASS);
        let useEffectPath = null;

        if (canBeRemovedUsingRemoveEventListener(unRemovedListener, className)) {
            if (isClassComponent && (t.isIdentifier(unRemovedListener.listenerNode)
                    || (t.isCallExpression(unRemovedListener.listenerNode) && unRemovedListener.listenerNode.callee.property?.name === 'bind'))) {
                removeListeneUsingAbortController(containerPath, containerType, unRemovedListener, destructorBody, isTypescript, className);
            } else {
                if (unRemovedListener.options) {
                    if (isTypescript && t.isObjectExpression(unRemovedListener.options)) {
                        if (unRemovedListener.options?.properties?.find((property) => property.key.name === 'passive')
                            && unRemovedListener.options?.properties.length === 1) {
                            removeListenerStatement = template.ast`${unRemovedListener.eventTarget}?.removeEventListener(${unRemovedListener.eventType}, ${unRemovedListener.eventListener})`;
                        } else if (unRemovedListener.options?.properties?.find((property) => property.key.name === 'passive')
                            && unRemovedListener.options?.properties.length > 1) {
                            const propertiesWithoutPassive = unRemovedListener.options?.properties?.filter((property) => property.key.name !== 'passive');
                            const optionsWithoutPassive = generate(t.objectExpression(propertiesWithoutPassive)).code;
                            removeListenerStatement = template.ast`${unRemovedListener.eventTarget}?.removeEventListener(${unRemovedListener.eventType}, ${unRemovedListener.eventListener}, ${optionsWithoutPassive}})`;
                        }
                    } else {
                        const optionsSourceCode = generate(unRemovedListener.options).code;
                        removeListenerStatement = template.ast`${unRemovedListener.eventTarget}.removeEventListener(${unRemovedListener.eventType}, ${unRemovedListener.eventListener}, ${optionsSourceCode})`;
                    }
                } else {
                    if (isTypescript && !CONSTANTS.WINDOW_OBJECTS.some((windowObj) => unRemovedListener.eventTarget.startsWith(windowObj))) {
                        removeListenerStatement = template.ast`${unRemovedListener.eventTarget}?.removeEventListener(${unRemovedListener.eventType}, ${unRemovedListener.eventListener})`;
                    } else {
                        removeListenerStatement = template.ast`${unRemovedListener.eventTarget}.removeEventListener(${unRemovedListener.eventType}, ${unRemovedListener.eventListener})`;
                    }
                }

                if (!isClassComponent) {
                    useEffectPath = getParentUseEffectPath(unRemovedListener.path);
                }

                if (useEffectPath) {
                    const { destructorBody } = getReturnFunctionBlockInUseEffect(containerPath, useEffectPath);
                    destructorBody.push(removeListenerStatement);
                } else {
                    destructorBody.push(removeListenerStatement);
                }
            }
        } else {
            removeListeneUsingAbortController(containerPath, containerType, unRemovedListener, destructorBody, isTypescript, className);
        }
    }
};

export const fixEventListenerLeaksInFunctionalComponent = (programPath, functionPath, pluginOptions) => {
    if (!hasListeners(programPath, functionPath)) {
        return;
    }

    const unRemovedListeners = getUnRemovedListeners(programPath, functionPath, CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT);

    if (unRemovedListeners?.length) {
        const { destructorBody } = getFunctionalComponentDestructor(programPath, functionPath);
        const isTypescript = !!CONSTANTS.TYPESCRIPT_EXTENSIONS.includes(pluginOptions.fileExtension);
        removeListeners(unRemovedListeners, functionPath.get('body'), CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT, destructorBody, null, isTypescript);

        LeakFactorStats.addFilesRefactoredForEventListenerLeak(pluginOptions.fileName);
        LeakFactorStats.addEventListenerLeaksCount(unRemovedListeners.length);
    }
};

export const fixEventListenerLeaksInClass = (programPath, currentFramework, classDecPath, pluginOptions) => {
    if (!hasListeners(programPath, classDecPath.get('body.0').parentPath, CONSTANTS.CONTAINER_TYPES.CLASS, classDecPath.node.id?.name)) {
        return;
    }

    const classBodyPath = classDecPath.get('body');
    const className = classDecPath.node.id?.name;
    const unRemovedListeners = getUnRemovedListeners(programPath, classBodyPath, CONSTANTS.CONTAINER_TYPES.CLASS, className);
    const isTypescript = !!CONSTANTS.TYPESCRIPT_EXTENSIONS.includes(pluginOptions.fileExtension);

    if (unRemovedListeners?.length) {
        const { destructorBody } = getClassDestructor(programPath, classDecPath, currentFramework);
        removeListeners(unRemovedListeners, classBodyPath, CONSTANTS.CONTAINER_TYPES.CLASS, destructorBody, className, isTypescript);
        LeakFactorStats.addFilesRefactoredForEventListenerLeak(pluginOptions.fileName);
        LeakFactorStats.addEventListenerLeaksCount(unRemovedListeners.length);
    }
};
