import generate from '@babel/generator';
import * as t from '@babel/types';
import CONSTANTS from '../constants';
import { getExistingClassDestructor } from './classHelperFunctions';
import { getExistingFunctionalComponentDestructors, getFunctionName } from './functionalComponentHelpers';
import { getCalledMethodName, isArrayVariable } from './utils';

export const hasCollectionVariables = (programPath, classDecPath) => {
    let hasCollectionVariables = false;

    programPath.traverse({
        'VariableDeclarator'(varPath) {
            if (isArrayVariable(varPath.node) && !(varPath.findParent((parentPath) => parentPath.isExportNamedDeclaration()))) {
                if (varPath.isVariableDeclarator()) {
                    if (!varPath.findParent((path) => path.isCallExpression() || path.isBlockStatement())) {
                        hasCollectionVariables = true;
                        varPath.stop();
                    }
                } else {
                    hasCollectionVariables = true;
                    varPath.stop();
                }
            }
        }
    });

    if (classDecPath) {
        classDecPath.traverse({
            ClassProperty(propertyPath) {
                const { node } = propertyPath;
                if (node.typeAnnotation?.typeAnnotation?.typeName?.name === 'QueryList') {
                    hasCollectionVariables = true;
                    propertyPath.stop();
                }
            }
        });
    }

    return hasCollectionVariables;
};

export const getUnclearedCollections = (programPath, containerPath, containerType) => {
    const allCollections = getAllWritableCollections(programPath, containerPath);
    let unClearedCollections = allCollections;
    let clearedCollections = [];

    if (allCollections.length) {
        if (containerType === CONSTANTS.CONTAINER_TYPES.CLASS) {
            const { path } = getExistingClassDestructor(containerPath);

            // If no destructor, means vars were not cleared
            if (path) {
                clearedCollections = getCollectionsClearedInDestructor(programPath, path);
            }
        } else {
            const destructors = getExistingFunctionalComponentDestructors(containerPath);

            // If no destructor, means vars were not cleared
            if (destructors.length) {
                const totalClearedCollections = [];

                destructors.forEach((destructor) => {
                    const clearedCollectionsInDestructor = getCollectionsClearedInDestructor(programPath, destructor.path);
                    clearedCollectionsInDestructor.length && totalClearedCollections.push(...clearedCollectionsInDestructor);
                });

                clearedCollections = totalClearedCollections;
            }
        }

        if (clearedCollections?.length) {
            unClearedCollections = unClearedCollections.filter((collection) => {
                const collectionName = collection.path.node.key?.name || collection.path.node.id.name;

                return clearedCollections.every((clearedCollection) => {
                    return !(generate(clearedCollection).code).includes(collectionName);
                });
            });
        }
    }

    return unClearedCollections;
};

const getAllWritableCollections = (programPath, containerPath) => {
    const collections = [];

    const addToList = (node, varPath, type) => {
        if (node.typeAnnotation?.typeAnnotation) {
            const collectionType = node.typeAnnotation.typeAnnotation;

            if (!(CONSTANTS.MODIFIERS.READONLY.includes(collectionType?.operator))
                && !(CONSTANTS.MODIFIERS.READONLY.includes(collectionType?.typeName?.name))) {
                collections.push({ path: varPath, type });
            }
        } else {
            collections.push({ path: varPath, type });
        }
    };
    programPath.traverse({
        'VariableDeclarator'(variablePath) {
            const { node } = variablePath;

            if (isArrayVariable(variablePath.node)
                && !variablePath.findParent((path) => path.isCallExpression() || path.isBlockStatement())
                && node.id.typeAnnotation?.typeAnnotation?.operator !== 'readonly') {
                if (generate(variablePath.node.value).code.includes('new Set')) {
                    addToList(node, variablePath, 'Set');
                } else {
                    addToList(node, variablePath, 'Array');
                }
            }
        }
    });

    if (containerPath.isClassDeclaration()) {
        containerPath.traverse({
            ClassProperty(propertyPath) {
                if (propertyPath.node.typeAnnotation?.typeAnnotation?.typeName?.name === 'QueryList') {
                    addToList(propertyPath.node, propertyPath, 'AngularQueryList');
                }
            }
        });
    }

    return collections;
};

const getCollectionsClearedInDestructor = (programPath, destructorPath) => {
    const totalVarsClearedInDestructor = [];

    // Case 1: If var was cleared directly in destructor
    const varsClearedDirectlyInDestructor = getClearedCollections(destructorPath);
    varsClearedDirectlyInDestructor.length && totalVarsClearedInDestructor.push(...varsClearedDirectlyInDestructor);

    // Case 2: Var was cleared in destructor via another method call
    destructorPath.traverse({
        'CallExpression|OptionalCallExpression'(callPath) {
            const calleeProperty = callPath.node.callee.property;

            const methodCalledInDestructor = generate(calleeProperty || callPath.node.callee).code;
            const varsClearedViaAnotherFunction = getCollectionsClearedInMethod(programPath, methodCalledInDestructor);

            varsClearedViaAnotherFunction.length && totalVarsClearedInDestructor.push(...varsClearedViaAnotherFunction);
        }
    });

    return totalVarsClearedInDestructor;
};

const getCollectionsClearedInMethod = (programPath, methodName) => {
    const variablesClearedInMethod = [];

    const checkForRemovedVariable = (currentMethodPath, currentMethodName, methodName) => {
        if (currentMethodName === methodName) {
            const varClearedInCurrentMethod = getClearedCollections(currentMethodPath);
            varClearedInCurrentMethod.length && variablesClearedInMethod.push(...varClearedInCurrentMethod);

            currentMethodPath.traverse({
                'CallExpression|OptionalCallExpression'(callPath) {
                    const methodCalledInMethod = getCalledMethodName(callPath.node.callee);

                    if (methodCalledInMethod && methodCalledInMethod !== currentMethodName) {
                        getCollectionsClearedInMethod(programPath, methodCalledInMethod);
                    }
                }
            });
        }
    };

    programPath.traverse({
        'FunctionDeclaration|ArrowFunctionExpression'(functionPath) {
            getFunctionName(functionPath) && checkForRemovedVariable(functionPath, getFunctionName(functionPath), methodName);
        },
        ClassMethod(classMethodPath) {
            checkForRemovedVariable(classMethodPath, generate(classMethodPath.node.key).code, methodName);
        }
    });

    return variablesClearedInMethod;
};

const getClearedCollections = (methodPath) => {
    const clearedCollections = [];

    methodPath.traverse({
        AssignmentExpression(assignmentExpPath) {
            const { node } = assignmentExpPath;

            if ((t.isIdentifier(node.left) || t.isMemberExpression(node.left)) && (
                node.right.value === 0
                || node.right.value === ''
                || t.isNullLiteral(node.right)
                || (t.isIdentifier(node.right) && node.right.name === 'undefined')
            )) {
                clearedCollections.push(node.left);
            }
        },
        UnaryExpression(unaryExpPath) {
            const { node } = unaryExpPath;

            if (node.operator === 'delete' && node.argument?.object) {
                clearedCollections.push(node.argument?.object);
            }
        },
        'CallExpression|OptionalCallExpression'(callPath) {
            const callNode = callPath.node;

            if ((t.isMemberExpression(callNode.callee) || t.isOptionalMemberExpression(callNode.callee))
                && (callNode.callee.property.name === 'splice' || callNode.callee.property.name === 'destroy')) {
                clearedCollections.push(callNode.callee.object);
            }
        }
    });

    return clearedCollections;
};



// export const isCollectionCleared = (collection, destructorPath) => {
//     let collectionCleared = false;
//     const collectionName = collection.key ? collection.key.name : collection.id.name;

//     destructorPath.traverse({
//         AssignmentExpression(assignmentExpPath) {
//             const { node } = assignmentExpPath;

//             if (generate(node.left).code.includes(collectionName) && (node.right.value === 0 || node.right.value === '' || t.isNullLiteral(node.right)
//                 || (t.isIdentifier(node.right) && node.name === 'undefined')
//             )) {
//                 collectionCleared = true;
//                 assignmentExpPath.stop();
//             }
//         },
//         UnaryExpression(unaryExpPath) {
//             const { node } = unaryExpPath;

//             if (node.operator === 'delete' && node.argument?.object?.name === collectionName) {
//                 collectionCleared = true;
//                 unaryExpPath.stop();
//             }
//         },
//         CallExpression(callPath) {
//             const callNode = callPath.node;

//             if (t.isMemberExpression(callNode.callee) && callNode.callee.property.name === 'splice') {
//                 const calleeObject = generate(callNode.callee.object).code;
//                 const collectionReference = t.isClassProperty(collection) ? `this.${collectionName}` : collectionName;

//                 if (calleeObject === collectionReference) {
//                     collectionCleared = true;
//                     callPath.stop();
//                 }
//             }
//         }
//     });

//     return collectionCleared;
// };
