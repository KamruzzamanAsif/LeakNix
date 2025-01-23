/* eslint-disable prefer-destructuring */
import * as t from '@babel/types';
import template from '@babel/template';
import Case from 'case';
import CONSTANTS from '../constants';
// eslint-disable-next-line import/no-cycle
import { getNewIdentifier, importSpecifierFromSource, isSpecifierImported, replaceWithAssignmentStatement } from './utils';
import generate from '@babel/generator';

const getfirstUseEffectPath = (functionPath) => {
    let firstUseEffectPath = null;

    functionPath.traverse({
        CallExpression(callExpressionPath) {
            const calleeName = callExpressionPath.node.callee.property?.name || callExpressionPath.node.callee.name;

            if (calleeName && (calleeName === CONSTANTS.USE_EFFECT_HOOK || calleeName === CONSTANTS.USE_LAYOUT_EFFECT_HOOK)) {
                firstUseEffectPath = callExpressionPath;
                callExpressionPath.stop();
            }
        }
    });

    return firstUseEffectPath;
};

export const getReturnFunctionBlockInUseEffect = (functionPath, useEffectPath) => {
    const useEffectBlockCallBack = useEffectPath.node.arguments?.[0]?.body?.body;
    let destructorPath = null;
    let destructorBody = null;

    // 1. If useeffect does not contain block callback, convert it to block first
    if (!useEffectBlockCallBack) {
        convertImplicitReturnToCallBackBlockWithReturn(useEffectPath);
    }

    const existingDestructor = getExistingReturnFunctionInUseEffect(functionPath, useEffectPath);
    const existingDestructorPath = existingDestructor.destructorPath;
    const existingDestructorBody = existingDestructor.destructorBody;

    if (existingDestructorPath) {
        if ((!t.isBlockStatement(existingDestructorBody)) && existingDestructorPath.parentPath.isBlockStatement()) {
            if (Array.isArray(existingDestructorBody) && existingDestructorBody?.length === 1 && t.isIdentifier(existingDestructorBody?.[0])) {
                // Check if return identifier is an arrow function
                const destructor = getReturnFunctionFromIdentifierBinding(functionPath, useEffectPath.node.arguments[0]?.body.name);

                destructorBody = destructor.body;
                destructorPath = destructor.path;
                return { destructorPath, destructorBody };
            }

            // if return func is not a block, first convert to block
            const buildReturn = template.statement(`
                return () => {
                    EXISTING_RETURN_STATEMENT
                }
            `);

            const returnFunctionStatement = buildReturn({
                EXISTING_RETURN_STATEMENT: existingDestructorBody
            });

            existingDestructorPath.replaceWith(returnFunctionStatement);

            return getExistingReturnFunctionInUseEffect(functionPath, useEffectPath);
        }

        return { destructorPath: existingDestructorPath, destructorBody: existingDestructorBody };
    }

    // No explict return function block
    const returnFunctionStatement = template.ast(`
        return () => {}
    `);

    const useEffectCallbackBody = useEffectPath.node.arguments[0].body;

    if (t.isBlockStatement(useEffectCallbackBody)) {
        useEffectPath.node.arguments[0].body.body.push(returnFunctionStatement);
    }

    if (t.isArrowFunctionExpression(useEffectCallbackBody)) {
        useEffectPath.node.arguments[0].body.body.body.push(returnFunctionStatement);
    }

    return getExistingReturnFunctionInUseEffect(functionPath, useEffectPath);
};

export const getExistingReturnFunctionInUseEffect = (functionPath, useEffectPath) => {
    let destructorBody = null;
    let destructorPath = null;

    // If only contains implicit return
    if (t.isArrowFunctionExpression(useEffectPath.node.arguments[0].body) || t.isFunctionExpression(useEffectPath.node.arguments[0].body)) {
        // Check if implicit returns function
        if (useEffectPath.node.arguments[0]?.body?.body) {
            destructorBody = useEffectPath.node.arguments[0].body.body;
            destructorPath = useEffectPath.get('arguments.0').get('body');
        }
    } else if (t.isIdentifier(useEffectPath.node.arguments[0]?.body)) {
        // Check if return identifier is an arrow function
        const destructor = getReturnFunctionFromIdentifierBinding(functionPath, useEffectPath.node.arguments[0]?.body.name);

        if (destructor.path) {
            destructorBody = destructor.body;
            destructorPath = destructor.path;
        }
    } else if (t.isBlockStatement(useEffectPath.node.arguments[0]?.body)) {
        useEffectPath.traverse({
            ReturnStatement(returnPath) {
                const { node } = returnPath;
                if (node.argument) {
                    if ((t.isArrowFunctionExpression(node.argument) || t.isFunctionExpression(node.argument))) {
                        destructorBody = node.argument?.body?.body || node.argument?.body;
                        destructorPath = returnPath;
                        returnPath.stop();
                    }

                    // Check if identifer is a reference to an arrow function in the FC, and return its path and body
                    if (t.isIdentifier(node.argument)) {
                        const destructor = getReturnFunctionFromIdentifierBinding(functionPath, node.argument.name);

                        if (destructor.path) {
                            destructorBody = destructor.body;
                            destructorPath = destructor.path;
                            returnPath.stop();
                        }
                    }
                }
            },
        });
    }

    return { destructorPath, destructorBody };
};

const getReturnFunctionFromIdentifierBinding = (functionPath, identifierName) => {
    const destructor = {};

    functionPath.traverse({
        VariableDeclarator(varPath) {
            const { node } = varPath;

            if (node.id.name === identifierName && t.isFunction(node.init)) {
                destructor.body = node.init.body?.body;
                destructor.path = varPath.get('init.body');
                functionPath.stop();
            }
        }
    });

    return destructor;
};

export const getFunctionName = (functionPath) => {
    const { node } = functionPath;

    if (t.isFunctionDeclaration(node) || t.isFunctionExpression(node)) {
        return node.id?.name;
    }

    if (t.isClassMethod(node)) {
        return node.key?.name;
    }

    return functionPath.parent?.left?.name || functionPath.parent.id?.name;
};

export const isReactFunctionalComponent = (functionPath) => {
    // 1. Check if function is top-most level
    if (functionPath.findParent((path) => path.isBlockStatement())) {
        return false;
    }

    if (functionPath.findParent((path) => path.isCallExpression() && !CONSTANTS.ALLOWED_REACT_COMPONENT_ENCAPSULATORS.includes(path.node.callee.name))) {
        return false;
    }

    // 2. Check if arrow function expression, should be assigned to const/let
    if (functionPath.isArrowFunctionExpression() && !t.isVariableDeclarator(functionPath.parent)) {
        return false;
    }

    // 3. Check if function name is capitalized
    const functionName = getFunctionName(functionPath)
    const functionNameCase = Case.of(functionName );

    if (functionNameCase !== 'pascal' && functionNameCase !== 'capital' && functionNameCase !== 'constant') {
        return false;
    }

    // 4. Check if function returns JSX
    const returnsJSX = getFunctionalComponentReturnPath(functionPath, functionName );

    if (!returnsJSX) {
        return false;
    }

    return true;
};

export const isCustomHook = (functionPath) => {
     // 1. Check if function is top-most level
    if (functionPath.findParent((path) => path.isCallExpression() || path.isBlockStatement())) {
        return false;
    }

    if (functionPath.findParent((path) => path.isCallExpression() && CONSTANTS.ALLOWED_REACT_COMPONENT_ENCAPSULATORS.includes(path.node.callee.name))) {
        return false;
    }

    // 2. Check if arrow function expression, should be assigned to const/let
    if (functionPath.isArrowFunctionExpression()) {
        if (!t.isVariableDeclarator(functionPath.parent)) {
            return false;
        }
    }

    // 3. Check if function name starts with lowercase 'use'
    if (!getFunctionName(functionPath)?.startsWith('use')) {
        return false;
    }

    return true;
};

const getFunctionalComponentReturnPath = (functionPath, functionName) => {
    let returnsJSX = false;
    let destructorPath = null;

    functionPath.traverse({
        ReturnStatement(returnPath) {
            const { node } = returnPath;

            if (node.argument) {
                const returnedNode = node.argument;

                if (t.isConditionalExpression(returnedNode)) {
                    returnsJSX = t.isJSXElement(returnedNode.consequent) || returnedNode.consequent.type === 'JSXFragment'
                    || t.isJSXElement(returnedNode.alternate) || returnedNode.alternate.type === 'JSXFragment';
                } else {
                    returnsJSX = t.isJSXElement(returnedNode) || returnedNode.type === 'JSXFragment';
                }

                if (returnsJSX && !returnPath.findParent((parentPath) => parentPath.isFunction() && getFunctionName(parentPath) !== functionName)) {
                    destructorPath = returnPath;
                    returnPath.stop();
                }
            }
        }
    });

    return destructorPath;
};

export const getFunctionalComponentDestructor = (programPath, functionPath) => {
    // first USEEFFECT WITH RETURN Block

    // 1. Check if Any USEFFECT exist
    const existingUseEffectPaths = [];

    functionPath.traverse({
        CallExpression(callPath) {
            const calleeName = callPath.node.callee.property ? callPath.node.callee.property.name : callPath.node.callee.name;

            if (calleeName && (calleeName === CONSTANTS.USE_EFFECT_HOOK || calleeName === CONSTANTS.USE_LAYOUT_EFFECT_HOOK)) {
                existingUseEffectPaths.push(callPath);
            }
        }
    });

    // 2. If no useffect exist import it, create a block use effect with return and return that
    if (!existingUseEffectPaths.length) {
        const isUseEffectImported = isSpecifierImported(programPath, CONSTANTS.IMPORTED_SPECIFIERS.USE_EFFECT_HOOK, CONSTANTS.IMPORT_SOURCES.REACT);
        const isReactImportedAsNameSpace = isSpecifierImported(programPath, 'React', 'react', 'namespace');

        if (!isUseEffectImported && !isReactImportedAsNameSpace) {
            importSpecifierFromSource(programPath, CONSTANTS.IMPORT_SOURCES.REACT, CONSTANTS.IMPORTED_SPECIFIERS.USE_EFFECT_HOOK, CONSTANTS.IMPORT_KINDS.VALUE);
        }

        const useEffectNode = template.ast(`
            ${isReactImportedAsNameSpace ? 'React.useEffect' : 'useEffect'}(() => {
                return () => {}
            }, []) 
        `);

        const functionName = getFunctionName(functionPath);
        if (getFunctionName(functionPath).startsWith('use')) {
            functionPath.get('body').unshiftContainer('body', useEffectNode);
        } else {
            let destructorPath = getFunctionalComponentReturnPath(functionPath, functionName);

            // if functional component return block does not exist, create one before inserting useeffect node
            if (!destructorPath) {
                const jsxBodyPath = functionPath.get('body');
                const returnBlockStatement = t.blockStatement(t.returnStatement(jsxBodyPath.node));
                jsxBodyPath.replaceWith(returnBlockStatement);
                destructorPath = getFunctionalComponentReturnPath(functionPath, functionName);
            }

            destructorPath.insertBefore(useEffectNode);
        }

        const firstUseEffectPath = getfirstUseEffectPath(functionPath);
        return getExistingReturnFunctionInUseEffect(functionPath, firstUseEffectPath);
    }

    // 3. If useeffect(s) exist,check if ANY one has BLOCK STATMENT as first param
    const useEffectPathWithBody = existingUseEffectPaths.find((path) => path.node.arguments[0]?.body?.body);

    // 4. If no useeffect contains block callback, convert the first one it to block with a return block in it, before returning return
    if (!useEffectPathWithBody) {
        if (t.isIdentifier(existingUseEffectPaths[0]?.node?.arguments?.[0]?.body)) {
            // Check if return identifier is an arrow function
            const destructor = getReturnFunctionFromIdentifierBinding(functionPath, existingUseEffectPaths[0].node.arguments[0]?.body.name);

            if (destructor.path) {
                const destructorBody = destructor.body;
                const destructorPath = destructor.path;

                return { destructorPath, destructorBody };
            }
        } else {
            convertImplicitReturnToCallBackBlockWithReturn(existingUseEffectPaths[0]);
        }
    }

    return getReturnFunctionBlockInUseEffect(functionPath, existingUseEffectPaths[0]);
};

const convertImplicitReturnToCallBackBlockWithReturn = (useeffectPath) => {
    const callbackBlockWithReturn = t.arrowFunctionExpression([], t.blockStatement([
        t.returnStatement(t.arrowFunctionExpression([], t.blockStatement([t.expressionStatement(useeffectPath.node.arguments[0].body)])))
    ]));
    useeffectPath.get('arguments.0').replaceWith(callbackBlockWithReturn);
};

export const getExistingFunctionalComponentDestructors = (functionPath) => {
    const destructors = [];

    functionPath.traverse({
        CallExpression(callPath) {
            const calleeName = callPath.node.callee.property?.name || callPath.node.callee.name;

            if (calleeName && (calleeName === CONSTANTS.USE_EFFECT_HOOK || calleeName === CONSTANTS.USE_LAYOUT_EFFECT_HOOK)) {
                const { destructorPath, destructorBody } = getExistingReturnFunctionInUseEffect(functionPath, callPath);
                destructorPath && destructors.push({ path: destructorPath, body: destructorBody });
            }
        }
    });

    return destructors;
};

export const getUseEffectCallbackPath = (useEffectPath) => {
    let useEffectCallbackPath = null;

    useEffectPath.traverse({
        'ArrowFunctionExpression|FunctionExpression'(functionExpressionPath) {
            useEffectCallbackPath = functionExpressionPath;
            functionExpressionPath.stop();
        }
    });

    return useEffectCallbackPath;
};

export const isInReactFunctionalComponent = (classDecPath) => {
    return classDecPath.findParent((parentPath) => {
        if (t.isFunctionDeclaration(parentPath.node) || t.isArrowFunctionExpression(parentPath.node)) {
            return isReactFunctionalComponent(parentPath);
        }

        return false;
    });
};

export const getParentUseEffectPath = (callPath) => {
    return callPath.findParent((parentPath) => {
        const parentCalleeName = parentPath.node.callee?.property?.name || parentPath.node.callee?.name;
        return parentCalleeName && (parentCalleeName === CONSTANTS.USE_EFFECT_HOOK || parentCalleeName === CONSTANTS.USE_LAYOUT_EFFECT_HOOK);
    });
};

export const getNewAssignmentDataInFunctionalComponent = (programPath, functionPath, callPath, isTypescript, name) => {
    let useEffectCallbackPath = null;
    const parentUseEffectPath = getParentUseEffectPath(callPath);
    let isRequestInUseEffectInnerScope = false;

    if (parentUseEffectPath) {
        useEffectCallbackPath = getUseEffectCallbackPath(parentUseEffectPath);
        isRequestInUseEffectInnerScope = (useEffectCallbackPath.scope.uid !== callPath.scope.uid)
                    || (callPath.findParent((parentPath) => t.isIfStatement(parentPath.node)));
    }

    const assignmentData = getNewAssignmentInFunctionalComponent(programPath, callPath, isTypescript, useEffectCallbackPath || functionPath, parentUseEffectPath, isRequestInUseEffectInnerScope, name);

    replaceWithAssignmentStatement(callPath, assignmentData, useEffectCallbackPath);
    return assignmentData;
};

export const getNewAssignmentInFunctionalComponent = (programPath, callPath, isTypescript, containerPath, useEffectPath, isInUseEffectInnerScope, name) => {
    const assignmentData = {
    };

    // If set timer inside useEffect
    if (useEffectPath) {
        assignmentData.id = getNewIdentifier(containerPath, name);
        // If set timer is nested, create var declaration to outer block scope first
        if (isInUseEffectInnerScope) {
            // Recreating the id instead of using/assigning assignmentData.id in order to detach from it; as this one (used in declaration) needs to be assigned type annotation.
            const variable = t.identifier(assignmentData.id.name);

            if (isTypescript) {
                Object.assign(variable, { typeAnnotation: t.typeAnnotation(t.anyTypeAnnotation()) });
            }

            const variableDeclarationNode = t.variableDeclaration('let', [t.variableDeclarator(variable, t.nullLiteral())]);

            // Ensure useeffect callback is a block
            containerPath.node.body.body.unshift(variableDeclarationNode);
            assignmentData.assignmentExpression = t.assignmentExpression('=', assignmentData.id, callPath.node);
        } else {
            // Perform var declaration + assignment in the same statement
            const timerVariableDeclarator = t.variableDeclarator(assignmentData.id, callPath.node);
            const timerVariableDeclaration = t.variableDeclaration('const', [timerVariableDeclarator]);
            assignmentData.assignmentExpression = timerVariableDeclaration;
        }
    } else {
        const useRefAssignment = getNewUseRefAssignmentData(programPath, containerPath, callPath, isTypescript, name, false);
        assignmentData.id = useRefAssignment.id;
        assignmentData.assignmentExpression = useRefAssignment.assignmentExpression;
    }

    return assignmentData;
};

export const getNewUseRefAssignmentData = (programPath, functionPath, nodePath, isTypescript, name, hasExistingAssignment) => {
    let variable = null;
    let useRefDeclarationNode = null;
    let useRefDeclarationExists = false;
    // TODO: support for ts :any

    const isUseRefImported = isSpecifierImported(programPath, CONSTANTS.IMPORTED_SPECIFIERS.USE_REF_HOOK, CONSTANTS.IMPORT_SOURCES.REACT);
    const isReactImportedAsNameSpace = isSpecifierImported(programPath, 'React', 'react', 'namespace');

    if (!isUseRefImported && !isReactImportedAsNameSpace) {
        importSpecifierFromSource(programPath, CONSTANTS.IMPORT_SOURCES.REACT, CONSTANTS.IMPORTED_SPECIFIERS.USE_REF_HOOK, CONSTANTS.IMPORT_KINDS.VALUE);
    }

    const useRefConstructor = t.callExpression(t.identifier(isReactImportedAsNameSpace ? 'React.useRef' : 'useRef'), [t.nullLiteral()]);

    if (hasExistingAssignment) {
        functionPath.traverse({
            VariableDeclaration(varDeclarationPath) {
                const { node } = varDeclarationPath;
                const { id, init } = node.declarations[0];

                if (node.kind === 'const' && id.name === name && (init.callee?.name === 'useRef' || init.callee?.property?.name === 'useRef')) {
                    useRefDeclarationExists = true;
                    varDeclarationPath.stop();
                }
            }
        });

        if (!useRefDeclarationExists) {
            const refNameIdentifier = t.identifier(name);

            if (isTypescript) {
                Object.assign(refNameIdentifier, { typeAnnotation: t.typeAnnotation(t.anyTypeAnnotation()) });
            }

            useRefDeclarationNode = t.variableDeclaration('const', [t.variableDeclarator(refNameIdentifier, useRefConstructor)], useRefConstructor);
        }

        variable = t.memberExpression(t.identifier(name), t.identifier('current'));
    } else {
        const newID = getNewIdentifier(functionPath, name);
        if (isTypescript) {
            Object.assign(newID, { typeAnnotation: t.typeAnnotation(t.anyTypeAnnotation()) });
        }

        useRefDeclarationNode = t.variableDeclaration('const', [t.variableDeclarator(newID, useRefConstructor)]);
        variable = t.memberExpression(t.identifier(newID.name), t.identifier('current'));
    }

    if (useRefDeclarationNode) {
        functionPath.get('body').unshiftContainer('body', useRefDeclarationNode);
    }

    const rightHandNode = (t.isAwaitExpression(nodePath.parent)) ? nodePath.parent : nodePath.node;

    return {
        id: variable,
        assignmentExpression: t.assignmentExpression('=', variable, rightHandNode)
    };
};

export const getDestructorForCleanUp = (programPath, functionPath, callPath) => {
    const parentUseEffectPath = getParentUseEffectPath(callPath);

    if (parentUseEffectPath) {
        return getReturnFunctionBlockInUseEffect(functionPath, parentUseEffectPath);
    }

    return getFunctionalComponentDestructor(programPath, functionPath);
};
