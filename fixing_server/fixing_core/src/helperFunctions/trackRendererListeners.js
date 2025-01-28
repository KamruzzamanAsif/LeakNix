import generate from '@babel/generator';
import * as t from '@babel/types';
import CONSTANTS from '../constants';
import { getAssignedIdentifier, isSpecifierImported } from './utils';

class Listener {
    static unassignedListeners = [];
    static undisposedlistenerCollections = [];
}

export const hasRendererListeners = (programPath, classDecPath, className) => {
    let containsRendererListeners = false;
    const isRendererImported = isSpecifierImported(programPath, 'Renderer2', '@angular/core');

    if (!isRendererImported) {
        return false;
    }

    classDecPath.traverse({
        'CallExpression|OptionalCallExpression'(callPath) {
            if (isRendererListener(callPath, classDecPath, className)) {
                containsRendererListeners = true;
                // eslint-disable-next-line no-useless-return
                callPath.stop();
            }
        },
    });

    return containsRendererListeners;
};

const isRendererListener = (listenerCallPath, classPath) => {
    // Ignore Returned listener calls; if a listener call is returned, it is currently very complicated to detect where the returned value is used (& cleared)
    if (t.isReturnStatement(listenerCallPath.parent)) {
        return false;
    }

    let callIsRendererListener = true;

    if (listenerCallPath.node.callee.property?.name === 'listen') {
        const listenerObject = listenerCallPath.node.callee.object;

        if (t.isIdentifier(listenerObject.property)) {
            classPath.traverse({
                ClassProperty(propertyPath) {
                    if (propertyPath.node.key.name === listenerObject.property.name) {
                        const propertyType = propertyPath.node.typeAnnotation?.typeAnnotation;

                        if (propertyType && !generate(propertyType).code.startsWith('Renderer2')) {
                            callIsRendererListener = false;
                            propertyPath.stop();
                        }
                    }
                },
                ClassMethod(classMethodPath) {
                    const { node } = classMethodPath;

                    if (node.kind === 'constructor') {
                        const parameterProperty = node.params.find((parameterProperty) => {
                            return parameterProperty.parameter?.name === listenerObject.property?.name;
                        });

                        const propertyType = parameterProperty && parameterProperty.parameter.typeAnnotation?.typeAnnotation;

                        if (propertyType && !generate(propertyType).code.startsWith('Renderer2')) {
                            callIsRendererListener = true;
                        }
                    }
                }
            });
        }
    }

    return callIsRendererListener;
};

export const getUnDisposedListeners = (containerPath, destructorMethodPath, className) => {
    Listener.unassignedListeners = [];
    Listener.undisposedlistenerCollections = [];

    containerPath.traverse({
        'CallExpression|OptionalCallExpression'(listenerCallPath) {
            if (!isRendererListener(listenerCallPath, containerPath, className)) {
                return;
            }

            const assignedID = getAssignedIdentifier(listenerCallPath);

            if (assignedID) {
                if (!isListenerDisposed(generate(assignedID).code, 'unlistenFunction', destructorMethodPath)) {
                    Listener.unassignedListeners.push(listenerCallPath);
                }
            } else {
                // if direct call
                const listenerCollection = listenerCallPath.findParent((parentPath) => {
                    return parentPath.isCallExpression() && generate(parentPath.node.callee).code.startsWith('this.')
                        && parentPath.node.callee.property?.name === CONSTANTS.COLLECTION_METHOD_NAMES.PUSH;
                    });

                if (listenerCollection) {
                    if (!isListenerDisposed(generate(listenerCollection.callee.object).code, CONSTANTS.ARRAY)) {
                        Listener.undisposedlistenerCollections.push(listenerCollection);
                    }
                } else {
                    Listener.unassignedListeners.push(listenerCallPath);
                }
            }
        }
    });

    const { unassignedListeners, listenerCollections } = Listener;
    return { unassignedListeners, listenerCollections };
};

export const isListenerDisposed = (listenerReference, listenerCollectorType, destructorMethodPath) => {
    let listenerDisposed = false;

    if (listenerCollectorType === CONSTANTS.ARRAY) {
        destructorMethodPath.traverse({
            'CallExpression|OptionalCallExpression'(callPath) {
                const { node } = callPath;

                // Case 1: this.collection.forEach(x => x ()) / this.collection.map(x => x ())
                if (generate(node.callee.object).code === listenerReference
                    && (callPath.node.callee.property === 'map' || callPath.node.callee.property === 'forEach')) {
                        listenerDisposed = true;
                        callPath.stop();
                }
            },
            ForOfStatement(callPath) {
                // Case 2: for (const x of this.collections) {x()}
                if (callPath.isForOfStatement && generate(callPath.node.right).code === listenerReference) {
                    listenerDisposed = true;
                    callPath.stop();
                }
            },
            // Case 3: while (this.collection.length) {this.collection.pop()();}
            'ForStatement|WhileStatement'(loopPath) {
                const conditionPath = loopPath.get('test');
                conditionPath.traverse({
                    MemberExpression(memberExpPath) {
                        if (generate(memberExpPath).code === listenerReference) {
                            listenerDisposed = true;
                            loopPath.stop();
                        }
                    }
                });
            }
        });
    } else {
        destructorMethodPath.traverse({
            'CallExpression|OptionalCallExpression'(callPath) {
                if (generate(callPath.node.callee).code === listenerReference && !(callPath.node.arguments.length)) {
                    listenerDisposed = true;
                    callPath.stop();
                }
            }
        });
    }

    return listenerDisposed;
};
