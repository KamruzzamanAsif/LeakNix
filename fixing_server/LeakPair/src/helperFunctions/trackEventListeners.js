/* eslint-disable no-restricted-syntax */
import generate from '@babel/generator';
import * as t from '@babel/types';
import CONSTANTS from '../constants';
import { getExistingClassDestructor, isInsideNestedFunctionInNamelessClass } from './classHelperFunctions';
import {  getFunctionName, getExistingFunctionalComponentDestructors } from './functionalComponentHelpers';
import { canBeRemovedUsingRemoveEventListener, getCalledMethodName } from './utils';

class EventListeners {
    static addedEvents = [];
    static removedEvents = [];

    static addToList = (currentListener, listenerStatus) => {
        const eventsList = listenerStatus === 'added' ? this.addedEvents : this.removedEvents;
        eventsList.push(currentListener);
    };
}

export const hasListeners = (programPath, containerPath, containerType, className) => {
    let hasListeners = false;

    containerPath.traverse({
        'CallExpression|OptionalCallExpression'(callPath) {
            if (isAddEventListener(programPath, callPath, containerType, className)) {
                hasListeners = true;
                // eslint-disable-next-line no-useless-return
                callPath.stop();
            }
        },
    });

    return hasListeners;
};

const isAddEventListener = (programPath, listenerCallPath, containerType, className) => {
    const { node } = listenerCallPath;

    if (!t.isMemberExpression(node.callee) && !t.isOptionalMemberExpression(node.callee)) {
       return false;
    }

    if (isInsideNestedFunctionInNamelessClass(containerType, className, listenerCallPath)) {
        return false;
    }

    if (t.isThisExpression(node.callee.object)) {
        return false;
    }

    if (node?.arguments[2] && !canBeRemovedUsingRemoveEventListener(getListenerDataFromEventCall(listenerCallPath), className) && t.isIdentifier(listenerCallPath.node.arguments[2])) {
        return false;
    }

    const eventTarget = generate(node.callee.object).code.replace(/[?!]$/, '');
    let containerUsesYTPlayer = false;

    programPath.traverse({
        NewExpression(newExpPath) {
            if (t.isMemberExpression(newExpPath.node.callee) && generate(newExpPath.node.callee).code === 'YT.Player') {
                containerUsesYTPlayer = true;
                newExpPath.stop();
            }
        }
    });

    if (!CONSTANTS.WINDOW_OBJECTS.some((windowObj) => eventTarget.startsWith(windowObj))
        && containerUsesYTPlayer) {
            return false;
    }

    if (containerType === CONSTANTS.CONTAINER_TYPES.CLASS
            && t.isIdentifier(node.arguments[1])
            && t.isIdentifier(node.arguments[2])) {
        return false;
    }

    return node.callee.property?.name === CONSTANTS.METHOD_NAMES.ADD_EVENT_LISTENER;
};

const areListenersUnmatched = (listener, removedListener) => {
    return (listener.eventType !== removedListener.eventType)
        || (listener.eventTarget !== removedListener.eventTarget)
        || (listener.eventListener !== removedListener.eventListener);
};

export const getUnRemovedListeners = (programPath, containerPath, containerType, className) => {
    EventListeners.addedEvents = [];
    EventListeners.removedEvents = [];

    getListeners(programPath, containerPath, containerType, className);

    let unRemovedListeners = EventListeners.addedEvents;
    getRemovedListeners(containerPath, containerType);

    if (EventListeners.removedEvents?.length) {
        // Filter out removed listeners from all listeners to get unremoved ones
        /* Event removed via removeEventListener will be considered removed only after ensuring that
            if third param is true or capture option is true in addeventlistener, then its true in removeeventlistener as well (vice versa)
        */

        unRemovedListeners = EventListeners.addedEvents.filter((listener) => EventListeners.removedEvents.every((removedListener) => {
            // Not all listeners removed using removeEventListener may actually be removed
            if (!removedListener.removedUsingAbortController) {
                if (!areListenersUnmatched(listener, removedListener)) {
                    if (listener.options || removedListener.options) {
                        let listenerCaptureValue = false;
                        let removedListenerCaptureValue = false;

                        if (listener.options) {
                            if (t.isObjectExpression(listener.options)) {
                                const captureProperty = listener.options?.properties?.find((property) => property.key.name === 'capture');
                                const captureValue = captureProperty?.value?.value || captureProperty?.value?.name;
                                listenerCaptureValue = captureValue || false;
                            }

                            if (t.isBooleanLiteral(listener.options)) {
                                listenerCaptureValue = listener.options.value;
                            }

                            if (t.isIdentifier(listener.options)) {
                                listenerCaptureValue = generate(listener.options).code;
                            }

                            // By default falsifying the case where third arg is an identifer; it may refer to an array, object or function call with respective capture value that we currently cant access
                        }

                        if (removedListener.options) {
                            if (t.isObjectExpression(removedListener.options)) {
                                const captureProperty = removedListener.options?.properties?.find((property) => property.key.name === 'capture');
                                const captureValue = captureProperty?.value?.value || captureProperty?.value?.name;
                                removedListenerCaptureValue = captureValue || false;
                            }

                            if (t.isBooleanLiteral(removedListener.options)) {
                                removedListenerCaptureValue = removedListener.options.value;
                            }

                            if (t.isIdentifier(removedListener.options)) {
                                removedListenerCaptureValue = generate(removedListener.options).code;
                            }
                        }

                        // The listener removed using removeEventListener was not actually removed, owing to differing capture value
                        return listenerCaptureValue !== removedListenerCaptureValue;
                    }
                } else {
                    return true;
                }
            }

            return false;
        }));
    }

    return unRemovedListeners;
};

const getListeners = (programPath, containerPath, containerType, className) => {
    containerPath.traverse({
        'CallExpression|OptionalCallExpression'(callPath) {
            const { node } = callPath;

            if (isAddEventListener(programPath, callPath, containerType, containerPath, className)) {
                if (node.arguments[2] && (t.isArrowFunctionExpression(node.arguments[2]) || t.isFunctionExpression(node.arguments[2]))) {
                    return;
                }

                const listenerStr = generate(node.arguments[1]).code;
                const currentListenerData = getListenerDataFromEventCall(callPath);

                if (listenerStr.startsWith('that.')) {
                    Object.assign(currentListenerData, { eventListener: listenerStr.replace(/^([^.]+)/, 'this') });
                }

                EventListeners.addToList(currentListenerData, 'added');
            }
        }
    });
};

const getListenerDataFromEventCall = (callPath) => {
    const { node } = callPath;

    return {
        path: callPath,
        node: node,
        eventTarget: generate(node.callee.object).code.replace(/[?!]$/, ''),
        eventType: generate(node.arguments[0]).code,
        eventTypeNode: node.arguments[0],
        eventListener: generate(node.arguments[1]).code,
        listenerNode: node.arguments[1],
        options: node.arguments[2]
    };
};

const getRemovedListeners = (containerPath, containerType) => {
    // Case 1: If listener was removed using abortController
    // Step 1. Detected abort calls in destructor
    let existingControllerName = null;
    const listenersWithSignalOption = [];

    EventListeners.addedEvents.forEach((listener) => {
        // Step 2. Detect if third object has signal property
        if (listener.options && (t.isObjectExpression(listener.options) || t.isObjectExpression(listener.options.expression))) {
            const properties = listener.options.expression?.properties || listener.options.properties;
            const signalProperty = properties.find((property) => property.key?.name === 'signal');

            if (signalProperty) {
                // Signal property exists
                existingControllerName = (signalProperty.value.name === 'signal') ? 'signal' : generate(signalProperty.value.object).code;
                listenersWithSignalOption.push(listener);
            }
        }
    });

    if (containerType === CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT) {
        const destructors = getExistingFunctionalComponentDestructors(containerPath);

        if (destructors.length) {
            destructors.forEach((destructor) => {
                listenersWithSignalOption.length && checkControllerAbortedInDestructor(listenersWithSignalOption, destructor.body, existingControllerName);
                checkRemovedListenersInDestructor(containerPath, destructor.path);
            });
        }
    } else {
        const { path, body } = getExistingClassDestructor(containerPath);
        if (path) {
            listenersWithSignalOption.length && checkControllerAbortedInDestructor(listenersWithSignalOption, body, existingControllerName);
            checkRemovedListenersInDestructor(containerPath, path);
        }
    }
};

const checkControllerAbortedInDestructor = (listeners, destructorBody, controllerName) => {
    listeners.forEach((listener) => {
        if (Array.isArray(destructorBody)) {
            const abortCalls = destructorBody.filter((statement) => t.isExpressionStatement(statement) && statement.expression.callee?.property?.name === 'abort');

            if (abortCalls.length) {
                // Step 3. Ensure the added and aborted controller names match
                abortCalls.forEach((abortCall) => {
                    const existingAbortCalleeObject = generate(abortCall.expression.callee.object).code;

                    if (existingAbortCalleeObject === controllerName) {
                        EventListeners.addToList({ removedUsingAbortController: true, ...listener }, 'removed');
                    }
                });
            }
        } else {
            if (destructorBody.callee?.property?.name === 'abort') {
                const existingAbortCalleeObject = generate(destructorBody.callee?.object).code;

                if (existingAbortCalleeObject === controllerName) {
                    EventListeners.addToList({ removedUsingAbortController: true, ...listener }, 'removed');
                }
            }
        }
    });
};

const checkRemovedListenersInDestructor = (containerPath, destructorPath) => {
    destructorPath.traverse({
        'CallExpression|OptionalCallExpression'(callPath) {
            const calleeProperty = callPath.node.callee.property;

            // Case 2: If listener was removed directly in destructor
            if (calleeProperty && generate(calleeProperty).code === CONSTANTS.METHOD_NAMES.REMOVE_EVENT_LISTENER) {
                EventListeners.addToList(getListenerDataFromEventCall(callPath), 'removed');
            } else {
                // Case 3. If listener was removed in destructor via function call
                const methodCalledInDestructor = generate(calleeProperty || callPath.node.callee).code;
                checkRemovedListenersInMethod(containerPath, methodCalledInDestructor);
            }
        }
    });
};

const checkRemovedListenersInMethod = (containerPath, methodNameToMatch) => {
    const checkedMethods = [];

    const checkForRemovedListener = (currentMethodPath, currentMethodName, methodName) => {
        if (currentMethodName && methodName && (currentMethodName === methodName)) {
            checkedMethods.push(currentMethodName);

            currentMethodPath.traverse({
                'CallExpression|OptionalCallExpression'(callPath) {
                    if (callPath.node.callee.property?.name === CONSTANTS.METHOD_NAMES.REMOVE_EVENT_LISTENER) {
                        EventListeners.addToList(getListenerDataFromEventCall(callPath), 'removed');
                    } else {
                        const methodCalledInMethod = getCalledMethodName(callPath.node.callee);

                        if (methodCalledInMethod && methodCalledInMethod !== currentMethodName && !checkedMethods.includes(methodCalledInMethod)) {
                            searchForMethod(methodCalledInMethod);
                        }
                    }
                }
            });
        }
    };

    const searchForMethod = (methodNameToMatch) => {
        containerPath.traverse({
            'FunctionDeclaration|ArrowFunctionExpression'(functionPath) {
                getFunctionName(functionPath) && checkForRemovedListener(functionPath, getFunctionName(functionPath), methodNameToMatch);
            },
            ClassMethod(classMethodPath) {
                checkForRemovedListener(classMethodPath, generate(classMethodPath.node.key).code, methodNameToMatch);
            },
            VariableDeclarator(varDeclarationPath) {
                if (t.isFunction(varDeclarationPath.node.init)) {
                    checkForRemovedListener(varDeclarationPath.get('init'), varDeclarationPath.node.id.name, methodNameToMatch);
                }
            },
            ClassProperty(propertyPath) {
                if (t.isFunction(propertyPath.node.value)) {
                    checkForRemovedListener(propertyPath.get('value'), propertyPath.node.key.name, methodNameToMatch);
                }
            },
        });
    };

    searchForMethod(methodNameToMatch);
};
