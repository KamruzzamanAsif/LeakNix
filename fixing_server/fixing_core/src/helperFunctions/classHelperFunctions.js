import * as t from '@babel/types';
import CONSTANTS from '../constants';
import createNgOnDestroy from './createNgOnDestroy';
import { getFramework, getNewIdentifier, replaceWithAssignmentStatement } from './utils';
import { jSXFragment } from '@babel/types';

// export const addBindingToConstructor = (constructorBody, fieldName) => {
//     const bindExpressionExists = constructorBody.some((statement) => statement.expression?.left?.property?.name === fieldName);

//     if (!bindExpressionExists) {
//         const thisField = t.memberExpression(t.thisExpression(), t.identifier(fieldName));
//         const bindExpression = t.memberExpression(thisField, t.identifier('bind'));
//         const bindCallExpression = t.callExpression(bindExpression, [t.thisExpression()]);
//         const bindingStatement = t.expressionStatement(t.assignmentExpression('=', thisField, bindCallExpression));
//         constructorBody.push(bindingStatement);
//     }
// };

// export const getConstructorBody = (classBodyPath, containerType) => {
//     let constructorMethodBody = '';

//     classBodyPath.traverse({
//         ClassMethod(classMethodPath) {
//             if (CONSTANTS.NODE_KINDS.CONSTRUCTOR === classMethodPath.node.kind) {
//                 classMethodPath.skip();
//                 constructorMethodBody = classMethodPath.scope.block.body.body;
//             }
//         }
//     });

//     if (!constructorMethodBody) {
//         const superCallExpression = t.expressionStatement(t.callExpression(t.identifier('super'), []));
//         const constructorMethod = t.classMethod(
//             CONSTANTS.NODE_KINDS.CONSTRUCTOR,
//             t.identifier(CONSTANTS.NODE_KINDS.CONSTRUCTOR),
//             [],
//             t.blockStatement((containerType === CONSTANTS.CONTAINER_TYPES.REACT_CLASS_COMPONENT) ? [superCallExpression] : [])
//         );

//         classBodyPath.node.unshift(constructorMethod);
//         constructorMethodBody = constructorMethod.body.body;
//     }

//     return constructorMethodBody;
// };

export const getConstructorPath = (classBodyPath) => {
    let constructorMethodPath = null;

    classBodyPath.traverse({
        ClassMethod(classMethodPath) {
            if (CONSTANTS.NODE_KINDS.CONSTRUCTOR === classMethodPath.node.kind) {
                classMethodPath.skip();
                constructorMethodPath = classMethodPath;
            }
        }
    });

    return constructorMethodPath;
};

export const getExistingClassDestructor = (classBodyPath) => {
    let existingDestructorPath = null;
    let existingDestructorBody = null;

    classBodyPath.traverse({
        'ClassMethod|ClassProperty'(classMemberPath) {
            const { node } = classMemberPath;

            if ((node.key) && ((node.key.name === CONSTANTS.METHOD_NAMES.NG_ON_DESTROY) || node.key.name === CONSTANTS.METHOD_NAMES.COMPONENT_WILL_UNMOUNT)) {
                existingDestructorPath = classMemberPath;

                if (classMemberPath.isClassProperty()) {
                    existingDestructorBody = node.value.body.body || node.value.body;
                } else {
                    existingDestructorBody = node.body.body;
                }
                classMemberPath.stop();
            }
        }
    });

    return { path: existingDestructorPath, body: existingDestructorBody };
};

export const getClassDestructor = (programPath, classDecPath, currentFramework) => {
    const { path, body } = getExistingClassDestructor(classDecPath);

    if (!path) {
        if (currentFramework === CONSTANTS.FRAMEWORKS.REACT) {
            const destructorMethodAST = t.classMethod(CONSTANTS.NODE_KINDS.METHOD, t.identifier(CONSTANTS.METHOD_NAMES.COMPONENT_WILL_UNMOUNT), [], t.blockStatement([]));
            classDecPath.node.body.body.push(destructorMethodAST);

            const { path, body } = getExistingClassDestructor(classDecPath);
            return { destructorPath: path, destructorBody: body };
        }

        if (currentFramework === CONSTANTS.FRAMEWORKS.ANGULAR) {
            createNgOnDestroy(programPath, classDecPath, classDecPath.get('body').node.body);

            const { path, body } = getExistingClassDestructor(classDecPath);
            return { destructorPath: path, destructorBody: body };
        }
    }

    return { destructorPath: path, destructorBody: body };
};

export const isInsideNestedFunctionInNamelessClass = (containerType, className, callPath) => {
    if (containerType === CONSTANTS.CONTAINER_TYPES.CLASS && !className) {
        const parentFunctionPath = callPath.findParent((parentPath) => t.isFunctionExpression(parentPath.node) || t.isFunctionDeclaration(parentPath));
        if (parentFunctionPath) {
            const insideNestedFunction = parentFunctionPath.findParent((parentPath) => t.isFunction(parentPath));

            if (insideNestedFunction && !className) {
                return true;
            }
        }
    }

    return false;
};

export const isReactClass = (classDecPath) => {
    const { superClass } = classDecPath.node;
    let containsJSX = false;

    classDecPath.traverse({
        JSXElement() {
            containsJSX = true;
        },
        JSXFragment() {
            containsJSX = true;
        }
    });

    return containsJSX && (
        t.isIdentifier(superClass, { name: 'Component' })
        || t.isIdentifier(superClass, { name: 'PureComponent' })
        || (t.isMemberExpression(superClass) && t.isIdentifier(superClass.object, { name: 'React' }) && t.isIdentifier(superClass.property, { name: 'Component' }))
    );
};

export const isDecoratedAngularClass = (programPath, classDecPath) => {
    const { node } = classDecPath;

    if (getFramework(programPath) === CONSTANTS.FRAMEWORKS.ANGULAR) {
        // Not supporting inherited angular classes without existng destructors currently becuase of potential parent class destructor override
        if (node.superClass && !classDecPath.node.body.body.find((node) => t.isClassMethod(node) && node.key?.name === 'ngOnDestroy')) {
            return false;
        }

        return !node.superClass && node.decorators && CONSTANTS.ANGULAR_CLASS_DECORATORS.includes(node.decorators[0]?.expression?.callee?.name);
    }

    return false;
};

export const getNewAssignmentInClass = (classPath, isTypescript, className, callPath, identifierName, hasExistingAssignment) => {
    const newIdentifier = getNewIdentifier(classPath, identifierName);
    const fieldDeclarationAST = t.classProperty(newIdentifier);
    isTypescript && Object.assign(fieldDeclarationAST, { typeAnnotation: t.typeAnnotation(t.anyTypeAnnotation()) });
    let inStaticMethod = false;

    if (isTypescript) {
        Object.assign(fieldDeclarationAST, { accessibility: 'private' });
    }

    const functionParentPath = callPath.getFunctionParent();
    if (functionParentPath.isArrowFunctionExpression) {
        if (functionParentPath.parent.static) {
            inStaticMethod = true;
        }
    } else {
        if (functionParentPath.node.static) {
            inStaticMethod = true;
        }
    }

    if (inStaticMethod) {
        Object.assign(fieldDeclarationAST, { static: true });
    }

    classPath.node.body.unshift(fieldDeclarationAST);

    // Create request var to classname.var
    const newAssignedIdentifier = t.memberExpression(inStaticMethod ? t.identifier(className) : t.thisExpression(), newIdentifier);

    const rightHandNode = t.isAwaitExpression(callPath.parent) ? callPath.parent : callPath.node;
    const assignmentData = {
        id: newAssignedIdentifier,
        assignmentExpression: t.assignmentExpression('=', newAssignedIdentifier, rightHandNode)
    };

    replaceWithAssignmentStatement(callPath, assignmentData);

    return assignmentData;
};
