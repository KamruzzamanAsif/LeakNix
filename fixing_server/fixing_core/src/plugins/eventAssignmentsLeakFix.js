import * as t from '@babel/types';
import { LeakFactorStats } from '../../LeakFactorStats';
import { getFunctionName } from '../helperFunctions/functionalComponentHelpers';
import CONSTANTS from '../constants';

const fixFunctionCallAssignments = (programPath, containerPath, pluginOptions) => {
    let eventAssignmentLeaksCount = 0;

    containerPath.traverse({
        JSXAttribute(jsxAttributePath) {
            const attributeName = jsxAttributePath.node.name.name;
            const attributeValue = jsxAttributePath.node.value;

            if (attributeName && attributeName.startsWith('on') && t.isJSXExpressionContainer(attributeValue)
                && t.isCallExpression(attributeValue.expression)) {
                // Check if the called function does not return a (arrow) function expression

                const calledFunctionName = attributeValue.expression.callee.property ? attributeValue.expression.callee.property.name : attributeValue.expression.callee.name;

                programPath.traverse({
                    'Function|ClassMethod'(currentFunctionPath) {
                        // Find function in file
                        if (getFunctionName(currentFunctionPath) === calledFunctionName) {
                            // eslint-disable-next-line array-callback-return
                            let returnStatement = null;
                            if (Array.isArray(currentFunctionPath.node.body.body)) {
                                returnStatement = currentFunctionPath.node.body.body.find((statement) => t.isReturnStatement(statement));
                            } else {
                                returnStatement = t.isReturnStatement(currentFunctionPath.node.body.body) ? currentFunctionPath.node.body.body : null;
                            }

                            // Only if either return does not exist or does not return function
                            if (!returnStatement || (!t.isFunction(returnStatement.argument))) {
                                const updatedEventAssignmentJSX = t.jsxExpressionContainer(t.arrowFunctionExpression([], attributeValue.expression));

                                jsxAttributePath.get('value').replaceWith(updatedEventAssignmentJSX);
                                eventAssignmentLeaksCount++;
                            }
                        }
                    }
                });
            }
        }
    });

    if (eventAssignmentLeaksCount) {
        LeakFactorStats.addEventAssignmentLeaksCount(eventAssignmentLeaksCount);
        LeakFactorStats.addFilesRefactoredForEventAssignmentLeak(pluginOptions.fileName);
    }
};

export const fixEventsAssignmentLeaksInFunctionalComponent = (programPath, currentFramework, functionPath, pluginOptions) => {
    if (currentFramework !== CONSTANTS.FRAMEWORKS.REACT) {
        return;
    }

    fixFunctionCallAssignments(programPath, functionPath, pluginOptions);
};

export const fixEventsAssignmentLeaksInClass = (programPath, currentFramework, classDecPath, pluginOptions) => {
    if (currentFramework !== CONSTANTS.FRAMEWORKS.REACT) {
        return;
    }

    fixFunctionCallAssignments(programPath, classDecPath, pluginOptions);
};
