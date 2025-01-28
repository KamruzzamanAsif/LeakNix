/* eslint-disable prefer-destructuring */
/* eslint-disable import/no-cycle */
/* eslint-disable default-case */
import * as types from '@babel/types';
import * as t from 'babel-types';
import generate from '@babel/generator';
import CONSTANTS from '../constants';
import {
 getFunctionName, getParentUseEffectPath, getNewUseRefAssignmentData, getDestructorForCleanUp, getUseEffectCallbackPath
} from './functionalComponentHelpers';
import { getClassDestructor, getNewAssignmentInClass } from './classHelperFunctions';

export const getAssignedIdentifier = (expressionPath) => {
    if (expressionPath.parentPath.isReturnStatement() || expressionPath.parentPath.isArrowFunctionExpression()) {
        return null;
    }

    const assignmentPath = expressionPath.findParent((parentPath) => {
        return t.isAssignmentExpression(parentPath.node)
            && (parentPath.node.start === expressionPath.container.start || parentPath.node.right.start === expressionPath.container.start);
    });

    if (assignmentPath) {
        return assignmentPath.node.left;
    }

    const varDeclaratorPath = expressionPath.findParent((parentPath) => {
        return t.isVariableDeclarator(parentPath.node)
            && (parentPath.node.start === expressionPath.container.start || parentPath.node.init.start === expressionPath.container.start);
    });

    if (varDeclaratorPath) {
        return varDeclaratorPath.node.id;
    }

    if (expressionPath.isClassProperty()) {
        return t.memberExpression(t.thisExpression(), t.identifier(expressionPath.node.key?.name));
    }

    return null;
};

export const isSpecifierImported = (programPath, requiredSpecifier, requiredSource, requiredSpecifierType) => {
    return programPath.get('body').find((importPath) => {
        if (!importPath.isImportDeclaration()) {
            return false;
        }

        if (importPath.node.importKind === 'type') {
            return false;
        }

        const existingSource = importPath.node.source?.value;

        if (existingSource !== requiredSource && !existingSource.includes(`${requiredSource}/`)) {
            return false;
        }

        const foundSpecifier = importPath.node.specifiers.find((specifier) => {
            if (requiredSpecifierType === 'namespace') {
                return specifier.type === 'ImportNamespaceSpecifier' && specifier.local?.name === requiredSpecifier;
            }

            return specifier.imported?.name === requiredSpecifier;
        });

        return foundSpecifier;
    });
};

export const importSpecifierFromSource = (programPath, source, specifierName, importKind) => {
    let existingImportPath = null;

    programPath.traverse({
        ImportDeclaration(importDeclarationPath) {
            if (importDeclarationPath.node.source?.value === source && importDeclarationPath.node.importKind !== 'type') {
                existingImportPath = importDeclarationPath;
                importDeclarationPath.stop();
            }
        }
    });

    if (existingImportPath) {
        const importSpecifierNode = Object.assign(t.importSpecifier(t.identifier(specifierName), t.identifier(specifierName)), {
            importKind,
        });

        existingImportPath.node.specifiers.push(importSpecifierNode);
    } else {
        const specifiers = [t.importSpecifier(t.identifier(specifierName), t.identifier(specifierName))];
        const newImportStatement = Object.assign(t.importDeclaration(specifiers, t.stringLiteral(source)), { importKind });
        const lastImport = programPath.get('body').filter((statement) => statement.isImportDeclaration()).pop();
        lastImport.insertAfter(newImportStatement);
    }
};

export const getFramework = (programPath) => {
    let currentFramework = null;

    programPath.traverse({
        ImportDeclaration(path) {
            const { node } = path;

            if (node.source?.value === CONSTANTS.IMPORT_SOURCES.ANGULAR_CORE) {
                currentFramework = CONSTANTS.FRAMEWORKS.ANGULAR;
            }

            const importsReactComponent = node.specifiers.some((specifier) => (CONSTANTS.REACT_COMPONENT.includes(specifier.imported?.name)));

            if (node.source?.value === CONSTANTS.IMPORT_SOURCES.REACT || importsReactComponent) {
                currentFramework = CONSTANTS.FRAMEWORKS.REACT;
            }
        },
    });

    return currentFramework;
};

export const getNewIdentifier = (containerPath, name) => {
    let containerBody = containerPath.get('body.body') || containerPath.get('body');
    if (Array.isArray(containerBody)) {
        containerBody = containerBody[0];
    }

    return containerBody.scope.generateUidIdentifier(name);
};

export const getNewSubjectIdentifier = (classBodyPath, observableName, emitterType) => {
    const subjectIdentifier = getNewIdentifier(classBodyPath, observableName || 'destroy$');

    const notifierType = t.genericTypeAnnotation(t.identifier(CONSTANTS.TYPES.SUBJECT_OBSERVABLE), t.typeParameterInstantiation([t.identifier(emitterType)]));
    const subjectInstance = t.newExpression(t.identifier(generate(notifierType).code), []);

    const newNotifierDeclaration = t.classProperty(subjectIdentifier, subjectInstance, t.typeAnnotation((notifierType)));
    Object.assign(newNotifierDeclaration, {
        accessibility: CONSTANTS.ACCESSIBILITY.PRIVATE,
    });

    classBodyPath.node.body.unshift(newNotifierDeclaration);

    return subjectIdentifier;
};

export const isArrayVariable = (node) => {
    if (node.typeAnnotation?.typeAnnotation?.typeName?.name === 'Array'
        || types.isTSArrayType(node.typeAnnotation?.typeAnnotation)) {
        return true;
    }

    if (t.isVariableDeclarator(node)) {
        return node.init?.elements
        || (t.isNewExpression(node.init) && node.init?.callee?.name === 'Array');
    }

    if (t.isClassProperty(node)) {
        return node.value?.elements
        || (t.isNewExpression(node.value) && node.value?.callee?.name === 'Array');
    }

    return false;
};

export const getSubjectEmitterType = (classProperty) => {
    let emitterType;
    const propertyType = generate(classProperty.typeAnnotation).code;

    if (propertyType.includes('Subject')) {
        switch (propertyType) {
            case 'Subject<void>':
                emitterType = 'void';
                break;

            case 'Subject<boolean>':
                emitterType = 'boolean';
                break;

            case 'Subject<any>':
                emitterType = 'any';
                break;

            case 'Subject<null>':
                emitterType = 'null';
                break;
        }
    }

    if (classProperty.value) {
        const propertyValue = generate(classProperty.value).code;

        if (propertyValue.includes('new Subject')) {
            switch (propertyValue) {
                case 'new Subject<void>()':
                    emitterType = 'void';
                    break;

                case 'new Subject()':
                    emitterType = 'void';
                    break;

                case 'new Subject<boolean>()':
                    emitterType = 'boolean';
                    break;

                case 'new Subject<any>()':
                    emitterType = 'any';
                    break;

                case 'new Subject<null>()':
                    emitterType = 'null';
                    break;
            }
        }
    }

    return emitterType;
};

export const getNewVariableReference = (programPath, containerPath, isClassComponent, name, isTypescript) => {
    let variableDeclaration = null;
    let variableReference = null;

    const identifier = getNewIdentifier(containerPath, isClassComponent ? name : `${name}Ref`);

    if (isTypescript) {
        Object.assign(identifier, { typeAnnotation: t.typeAnnotation(t.anyTypeAnnotation()) });
    }

    if (isClassComponent) {
        variableDeclaration = t.classProperty(identifier);
    } else {
        const isUseRefImported = isSpecifierImported(programPath, CONSTANTS.IMPORTED_SPECIFIERS.USE_REF_HOOK, CONSTANTS.IMPORT_SOURCES.REACT);

        if (!isUseRefImported) {
            importSpecifierFromSource(programPath, CONSTANTS.IMPORT_SOURCES.REACT, CONSTANTS.IMPORTED_SPECIFIERS.USE_REF_HOOK, CONSTANTS.IMPORT_KINDS.VALUE);
        }

        variableDeclaration = t.variableDeclaration('const', [t.variableDeclarator(identifier, t.callExpression(t.identifier('useRef'), [t.nullLiteral()]))]);
    }

    const containerBody = containerPath.node.body?.body || containerPath.node.body;
    containerBody.unshift(variableDeclaration);

    const variable = t.identifier(identifier.name);

    if (isClassComponent) {
        variableReference = t.memberExpression(t.thisExpression(), variable);
    } else {
        variableReference = t.memberExpression(variable, t.identifier('current'));
    }

    return variableReference;
};

export const updateIdForIncorrectAssignment = (programPath, containerPath, fileExtension, containerType, callPath, assignedIdentifier, className, newIdentifierName) => {
    let useEffectPath = '';
    const isTypescript = CONSTANTS.TYPESCRIPT_EXTENSIONS.includes(fileExtension);

    let assignmentData = {
        id: assignedIdentifier,
    };

    if (containerType === CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT) {
        useEffectPath = getParentUseEffectPath(callPath);
    }

    if (t.isIdentifier(assignedIdentifier)) {
        if (containerType === CONSTANTS.CONTAINER_TYPES.CLASS) {
            // Identifier vars should be replaced with class properties (this.varname)
            assignmentData = { ...assignmentData, ...getNewAssignmentInClass(containerPath, isTypescript, className, callPath, newIdentifierName, true) };
        } else {
            if (!useEffectPath) {
                // Replace local function vars with useRef in functional components
                assignmentData = { ...assignmentData, ...getNewUseRefAssignmentData(programPath, containerPath, callPath, isTypescript, newIdentifierName, true) };
            } else {
                // Replace nested vars with useRef in functional components
                const useEffectCallbackPath = getUseEffectCallbackPath(useEffectPath);
                if (callPath.parentPath.isVariableDeclarator()
                    && (useEffectCallbackPath.scope.uid !== callPath.scope.uid
                    || (callPath.findParent((parentPath) => t.isIfStatement(parentPath.node))))) {
                    assignmentData = { ...assignmentData, ...getNewUseRefAssignmentData(programPath, containerPath, callPath, isTypescript, newIdentifierName, true) };
                }
            }
        }
    }

    if (assignedIdentifier.object) {
        if (containerType === CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT) {
            // Member type vars that are not useRefs should be replaced with useRef in functional components
            if (!assignedIdentifier.property.name === 'current') {
                assignmentData = { ...assignmentData, ...getNewUseRefAssignmentData(programPath, containerPath, callPath, isTypescript, newIdentifierName) };
            }
        } else {
            if ((!generate(assignedIdentifier).code.startsWith('this.') && generate(assignedIdentifier.object).code !== className)
                || assignedIdentifier.computed) {
                // Member type vars not assigned to class properties should be replaced with class properties
                assignmentData = { ...assignmentData, ...getNewAssignmentInClass(containerPath, isTypescript, className, callPath, newIdentifierName, true) };
            }
        }
    }

    if (assignmentData.assignmentExpression) {
        replaceWithAssignmentStatement(callPath, assignmentData, useEffectPath);
    }

    return assignmentData.id;
};

export const replaceWithAssignmentStatement = (callPath, assignmentData) => {
    if (callPath.parentPath.isArrowFunctionExpression() || callPath.parentPath.isReturnStatement()) {
        if (callPath.parentPath.isArrowFunctionExpression()) {
            const updatedReturnBlock = t.blockStatement([t.expressionStatement(assignmentData.assignmentExpression), t.returnStatement(assignmentData.id)]);
            callPath.replaceWith(updatedReturnBlock);
        } else {
            callPath.parentPath.insertBefore(t.expressionStatement(assignmentData.assignmentExpression));
            callPath.parentPath.replaceWith(t.returnStatement(assignmentData.id));
        }

        callPath.skip();
    } else {
        let pathToReplace = null;

        if (t.isExpressionStatement(callPath.parent) || t.isAwaitExpression(callPath.parent)) {
            pathToReplace = callPath.parentPath;
        } else {
            pathToReplace = callPath;
        }

        pathToReplace.replaceWith(assignmentData.assignmentExpression);
        pathToReplace.skip();
    }
};

export const getClearedIdentifiersInMethod = (containerPath, methodNameToMatch, clearingMethodNames) => {
    const clearedIdentifiers = [];
    const checkedMethods = [];

    const checkForClearedIdentifiersOnMatch = (currentMethodPath, currentMethodName, methodNameToMatch) => {
        if (currentMethodName === methodNameToMatch) {
            checkedMethods.push(currentMethodName);
            currentMethodPath.traverse({
                'CallExpression|OptionalCallExpression'(callPath) {
                    if (clearingMethodNames.includes(callPath.node.callee.name)) {
                        clearedIdentifiers.push(callPath.node.arguments?.[0]);
                    } else {
                        const methodCalledInMethod = getCalledMethodName(callPath.node.callee);

                        if (methodCalledInMethod && (methodCalledInMethod !== currentMethodName) && !checkedMethods.includes(methodCalledInMethod)) {
                            searchForMethod(methodCalledInMethod);
                        }
                    }
                },
            });
        }
    };

    const searchForMethod = (methodNameToMatch) => {
        containerPath.traverse({
            FunctionDeclaration(functionPath) {
                getFunctionName(functionPath) && checkForClearedIdentifiersOnMatch(functionPath, getFunctionName(functionPath), methodNameToMatch);
            },
            ClassMethod(classMethodPath) {
                checkForClearedIdentifiersOnMatch(classMethodPath, classMethodPath.node.key.name, methodNameToMatch);
            },
            VariableDeclarator(varDeclarationPath) {
                if (t.isFunction(varDeclarationPath.node.init)) {
                    checkForClearedIdentifiersOnMatch(varDeclarationPath.get('init'), varDeclarationPath.node.id.name, methodNameToMatch);
                }
            }
        });
    };

    searchForMethod(methodNameToMatch);

    return clearedIdentifiers;
};

export const getCalledMethodName = (callee) => {
    if (t.isMemberExpression(callee) && t.isThisExpression(callee.object)) {
        return generate(callee.property).code;
    }

    if (t.isIdentifier(callee)) {
        return callee.name;
    }

    return false;
};

export const getDestroyerSubject = (classBodyPath, observableName) => {
    let subjectIdentifier = null;

    // 2.Create Subject declaration in class
    let subjectDeclarationExists = false;
    let emitterType = 'any';

    // generate(classPropertyPath.node.value).code.includes('new Subject') &&
    classBodyPath.traverse({
        ClassProperty(classPropertyPath) {
            const { node } = classPropertyPath;

            if (node.typeAnnotation || node.value) {
                const subjectEmitterType = getSubjectEmitterType(node);
                if ((subjectEmitterType || subjectEmitterType === null)
                    && (node.key.name.toLowerCase().includes('destroy')
                    || node.key.name.toLowerCase().includes('unsubscribe'))) {
                    subjectDeclarationExists = true;
                    subjectIdentifier = node.key;
                    emitterType = subjectEmitterType;
                    classPropertyPath.stop();
                }
            }
        }
    });

    if (!subjectDeclarationExists) {
        subjectIdentifier = getNewSubjectIdentifier(classBodyPath, observableName, emitterType);
    }

    return { subjectIdentifier, emitterType };
};

export const clearIdentifier = (programPath, containerPath, containerType, clearMethodName, identifier, nodepath, currentFramework) => {
    let destructor = null;

    if (containerType === CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT) {
        destructor = getDestructorForCleanUp(programPath, containerPath, nodepath);
    } else {
        destructor = getClassDestructor(programPath, containerPath, currentFramework);
    }

    let identifierAlreadyCleared = false;
    const { destructorPath, destructorBody } = destructor;

    destructorPath.traverse({
        CallExpression(callPath) {
            const { node } = callPath;
            const callArgument = generate(node.arguments[0]).code;

            if (clearMethodName === node.callee.name && callArgument === generate(identifier).code) {
                identifierAlreadyCleared = true;
                callPath.stop();
            }
        }
    });

    if (!identifierAlreadyCleared) {
        const clearStatement = t.expressionStatement(t.callExpression(t.identifier(clearMethodName), [identifier]));
        const bodyOfDestructor = destructorBody.body ? destructorBody.body : destructorBody
        bodyOfDestructor.push(clearStatement);
    }
};

export const canBeRemovedUsingRemoveEventListener = (listener, className) => {
    return (CONSTANTS.WINDOW_OBJECTS.some((windowObj) => listener.eventTarget.startsWith(windowObj))
        || listener.eventTarget.startsWith('this.')
        || listener.eventTarget.startsWith(`${className}.`)
        || listener.eventTarget.endsWith('.current'))
        && (!t.isFunction(listener.listenerNode)
        && !types.isTSAsExpression(listener.listenerNode)
        && !listener.listenerNode.computed
        && t.isStringLiteral(listener.eventTypeNode));
};
