import generate from '@babel/generator';
import * as t from '@babel/types';
import template from '@babel/template';
import { LeakFactorStats } from '../../LeakFactorStats';
import CONSTANTS from '../constants';
import { getFunctionName } from '../helperFunctions/functionalComponentHelpers';

const methodContainsBooleanAssignmentToNode = (containerPath, methodName, node, booleanValue) => {
    let containsBooleanAssignmentToNode = false;

    containerPath.traverse({
        ClassMethod(classMethodPath) {
            if (getFunctionName(classMethodPath) === methodName) {
                classMethodPath.traverse({
                    AssignmentExpression(assignmentExpPath) {
                        if (generate(assignmentExpPath.node.left).code === generate(node).code
                            && t.isBooleanLiteral(assignmentExpPath.node.right) && assignmentExpPath.node.right.value === booleanValue) {
                                containsBooleanAssignmentToNode = true;
                        }
                    }
                });
            }
        }
    });

    return containsBooleanAssignmentToNode;
};

const isMountStateTracker = (containerPath, node) => {
    let isMountStateTracker = false;
    let componentMountTracker = null;

    if (t.isThisExpression(node.object) && t.isIdentifier(node.property)) {
        if (methodContainsBooleanAssignmentToNode(containerPath, CONSTANTS.METHOD_NAMES.COMPONENT_DID_MOUNT, node, true)) {
            componentMountTracker = node;
        }

        if (componentMountTracker) {
            if (methodContainsBooleanAssignmentToNode(containerPath,  CONSTANTS.METHOD_NAMES.COMPONENT_WILL_UNMOUNT, componentMountTracker, false)) {
                isMountStateTracker = true;
            }
        }
    }

    return isMountStateTracker;
};

const pathHasMountStateTracker = (path, containerPath) => {
    let hasMountStateTracker = false;

    if (t.isMemberExpression(path.node)) {
        if (isMountStateTracker(containerPath, path.node)) {
            hasMountStateTracker = true;
        }
    } else {
        path.traverse({
            MemberExpression(memberExpPath) {
                if (isMountStateTracker(containerPath, memberExpPath.node)) {
                    hasMountStateTracker = true;
                    memberExpPath.stop();
                }
            }
        });
    }

    return hasMountStateTracker;
};

const hasStateUpdateCalls = (containerPath) => {
    let hasSetStateCalls = false;

    containerPath.traverse({
        CallExpression(callExpPath) {
            if (generate(callExpPath.node.callee).code === 'this.setState') {
                hasSetStateCalls = true;
                callExpPath.stop();
            }
        }
    });

    return hasSetStateCalls;
};

const updateMountStatusInLifeCycleMethod = (lifeCycleMethodPath, mountStateTracker, mountStatus) => {
    let mountStatusAlreadyUpdated = false;

    lifeCycleMethodPath.traverse({
        AssignmentExpression(assignmentExpPath) {
            if ((generate(assignmentExpPath.node.left).code === generate(mountStateTracker).code
                && generate(assignmentExpPath.node.right).code === mountStatus)) {
                mountStatusAlreadyUpdated = true;
                assignmentExpPath.stop();
            }
        }
    });

    if (!mountStatusAlreadyUpdated) {
        const isMountedAssignment = template.ast`${generate(mountStateTracker).code} = ${mountStatus}`;
        lifeCycleMethodPath.get('body').pushContainer('body', isMountedAssignment);
    }
};

const fixStateUpdateLeaks = (containerPath, pluginOptions) => {
    let stateUpdateLeaksCount = 0;
    let mountStateTracker = null;

    containerPath.traverse({
        ClassProperty(classPropertyPath) {
            if (t.isBooleanLiteral(classPropertyPath.node.value) && classPropertyPath.node.value.value === true) {
                const propertyReference = t.memberExpression(t.thisExpression(), t.identifier(classPropertyPath.node.key.name));

                if (isMountStateTracker(containerPath, propertyReference)) {
                    mountStateTracker = t.memberExpression(t.thisExpression(), t.identifier(classPropertyPath.node.key.name));
                    classPropertyPath.stop();
                }
            }
        },
        CallExpression(callExpPath) {
            const { node } = callExpPath;
            let mountStatusCheckedBeforeUpdate = false;

            if (generate(node.callee).code === 'this.setState') {
                const logicalParentPath = callExpPath.findParent((parentPath) => parentPath.isLogicalExpression());
                const conditionalParentPath = callExpPath.findParent((parentPath) => parentPath.isConditionalExpression());

                if (logicalParentPath) {
                    if (pathHasMountStateTracker(logicalParentPath.get('left'), containerPath)) {
                        mountStatusCheckedBeforeUpdate = true;
                        callExpPath.stop();
                    }
                }

                if (conditionalParentPath) {
                    if (pathHasMountStateTracker(conditionalParentPath.get('test'))) {
                        mountStatusCheckedBeforeUpdate = true;
                    }
                }

                if (!mountStatusCheckedBeforeUpdate) {
                    const pathToReplace = t.isStatement(callExpPath.parent) ? callExpPath.parentPath : callExpPath;

                    if (!mountStateTracker) {
                        const isMountedPropertyDeclaration = t.classProperty(t.identifier('isComponentMounted'), t.booleanLiteral(true));
                        mountStateTracker = t.memberExpression(t.thisExpression(), t.identifier('isComponentMounted'));
                        containerPath.get('body').unshiftContainer('body', isMountedPropertyDeclaration);
                    }

                    const newStateUpdateStatement = template.ast`
                        if (this.isComponentMounted) {
                            ${generate(node.callee).code}
                        }
                    `;

                    // if setstate parent is not block, for eg implicit return convert to block firdt

                    pathToReplace.replaceWith(newStateUpdateStatement);
                    pathToReplace.skip();

                    let componentDidMountPath = null;
                    let componentWillUnmountPath = null;

                    containerPath.traverse({
                        ClassMethod(classMethodPath) {
                            if (getFunctionName(classMethodPath) === CONSTANTS.METHOD_NAMES.COMPONENT_DID_MOUNT) {
                                componentDidMountPath = classMethodPath;
                            }

                            if (getFunctionName(classMethodPath) === CONSTANTS.METHOD_NAMES.COMPONENT_WILL_UNMOUNT) {
                                componentWillUnmountPath = classMethodPath;
                            }
                        }
                    });

                    if (!componentDidMountPath) {
                        const didMountMethod = t.classMethod('method', t.identifier(CONSTANTS.METHOD_NAMES.COMPONENT_DID_MOUNT), [], t.blockStatement([
                            t.expressionStatement(t.assignmentExpression('=', mountStateTracker, t.booleanLiteral(true)))
                        ]));

                        containerPath.get('body').pushContainer('body', didMountMethod);
                    } else {
                        updateMountStatusInLifeCycleMethod(componentDidMountPath, mountStateTracker, 'true');
                    }

                    if (!componentWillUnmountPath) {
                        const willUnmountMethod = t.classMethod('method', t.identifier(CONSTANTS.METHOD_NAMES.COMPONENT_WILL_UNMOUNT), [], t.blockStatement([
                            t.expressionStatement(t.assignmentExpression('=', mountStateTracker, t.booleanLiteral(false)))
                        ]));

                        containerPath.get('body').pushContainer('body', willUnmountMethod);
                    } else {
                        updateMountStatusInLifeCycleMethod(componentWillUnmountPath, mountStateTracker, 'false');
                    }

                    pathToReplace.skip();
                    stateUpdateLeaksCount++;
                } else {
                    callExpPath.skip();
                }
            }
        }
    });

    // if (stateUpdateLeaksCount) {
    //     LeakFactorStats.addEventAssignmentLeaksCount(eventAssignmentLeaksCount);
    //     LeakFactorStats.addFilesRefactoredForEventAssignmentLeak(pluginOptions.fileName);
    // }
};

export const fixStateUpdateLeaksInClass = (classDecPath, currentFramework, pluginOptions) => {
    if (currentFramework !== CONSTANTS.FRAMEWORKS.REACT) {
        return;
    }

    if (!hasStateUpdateCalls(classDecPath)) {
        return;
    }

    fixStateUpdateLeaks(classDecPath, pluginOptions);
};

// export const fixEventsAssignmentLeaksInFunctionalComponent = (programPath, functionPath, pluginOptions) => {
//     fixFunctionCallAssignments(programPath, functionPath, pluginOptions);
// };
