import generate from '@babel/generator';
import * as t from '@babel/types';
import template from '@babel/template';
import CONSTANTS from '../constants';
import { getNewIdentifier } from './utils';
import { typeAnnotation } from '@babel/types';

export const removeListeneUsingAbortController = (containerPath, containerType, unRemovedListener, destructorBody, isTypescript, className) => {
        // Step 1: Create declaration if not already exists:  controller = new AbortController();
    let abortControllerIdentifier = null;
    let newAbortControllerDeclaration = null;
    const containerBody = containerPath.node.body;
    const newAbortControllerInstance = t.newExpression(t.identifier('AbortController'), []);

    if (containerType === CONSTANTS.CONTAINER_TYPES.CLASS) {
        const existingAbortControllerClassProperty = containerBody.find((statement) => {
            return t.isClassProperty(statement) && generate(statement.value).code.includes('new AbortController');
        });

        abortControllerIdentifier = existingAbortControllerClassProperty && existingAbortControllerClassProperty.key;

        if (!abortControllerIdentifier) {
            abortControllerIdentifier = getNewIdentifier(containerPath, 'controller');

            newAbortControllerDeclaration = t.classProperty(
                abortControllerIdentifier,
                newAbortControllerInstance,
                isTypescript ? t.typeAnnotation(t.anyTypeAnnotation()) : null,
                null
            );
        }

        abortControllerIdentifier = t.memberExpression(t.thisExpression(), abortControllerIdentifier);
    } else {
        // If is functional component
        const existingAbortControllerVariable = containerBody.find((statement) => {
            return t.isVariableDeclaration(statement) && generate(statement.declarations[0].init).code.includes('new AbortController');
        });

        abortControllerIdentifier = existingAbortControllerVariable ? t.identifier(existingAbortControllerVariable?.declarations[0]?.id.name) : null;

        if (!abortControllerIdentifier) {
            abortControllerIdentifier = getNewIdentifier(containerPath, 'controller');
            let abortControllerVariableDeclarator = null;

            if (isTypescript) {
                const abortControllerIDWithType = t.identifier(generate(abortControllerIdentifier).code);
                Object.assign(abortControllerIDWithType, { typeAnnotation: t.typeAnnotation(t.anyTypeAnnotation()) });

                abortControllerVariableDeclarator = t.variableDeclarator(abortControllerIDWithType, newAbortControllerInstance);
            } else {
                abortControllerVariableDeclarator = t.variableDeclarator(abortControllerIdentifier, newAbortControllerInstance);
            }

            newAbortControllerDeclaration = t.variableDeclaration('let', [abortControllerVariableDeclarator]);
        }
    }

    if (newAbortControllerDeclaration) {
        containerBody.unshift(newAbortControllerDeclaration);
    }

    // Step 2: Add option { signal: controller.signal } as third param to addevent call if not already exist
    const signalObjectProperty = isTypescript ? (t.optionalMemberExpression(abortControllerIdentifier, t.identifier('signal'), false, true))
        : (t.memberExpression(abortControllerIdentifier, t.identifier('signal'), false, true));

    if (unRemovedListener.options) {
        const listenerCallOptions = unRemovedListener.options;

        // Case 1. Options has object but no signal
        if (t.isObjectExpression(listenerCallOptions)) {
            const signalProperty = listenerCallOptions.properties.find((property) => property.key.name === 'signal');

            if (!signalProperty) {
                const signalObject = t.objectProperty(t.identifier('signal'), signalObjectProperty);

                if (isTypescript) {
                    const updatedOptions = t.objectExpression([...listenerCallOptions.properties, signalObject]);
                    const updatedOptionsWithType = t.tsAsExpression(updatedOptions, t.tsTypePredicate(t.identifier('AddEventListenerOptions')));
                    unRemovedListener.path.get('arguments.2').replaceWith(updatedOptionsWithType);
                } else {
                    unRemovedListener.node.arguments[2].properties.push(signalObject);
                }
            }
        // Case 2. Options is a boolean
        } else if (t.isBooleanLiteral(listenerCallOptions)) {
            const signalObject = t.objectProperty(t.identifier('signal'), signalObjectProperty);
            const captureProperty = t.objectProperty(t.identifier('capture'), t.BooleanLiteral(listenerCallOptions.value));
            const updatedOptions = t.objectExpression([captureProperty, signalObject]);

            if (isTypescript) {
                const updatedOptionsWithType = t.tsAsExpression(updatedOptions, t.tsTypePredicate(t.identifier('AddEventListenerOptions')));
                unRemovedListener.path.get('arguments.2').replaceWith(updatedOptionsWithType);
            } else {
                unRemovedListener.node.arguments[2] = updatedOptions;
            }
        // Case 3. Options is an identifier
        } else if (t.isIdentifier(listenerCallOptions)) {
            const signalObject = t.objectProperty(t.identifier('signal'), signalObjectProperty);
            const updatedOptions = t.objectExpression([t.spreadElement(listenerCallOptions), signalObject]);

            unRemovedListener.node.arguments[2] = updatedOptions;
        }
    } else {
        const signalObject = t.objectProperty(t.identifier('signal'), signalObjectProperty);

        if (isTypescript) {
            const updatedOptionsWithType = t.tsAsExpression(t.ObjectExpression([signalObject]), t.tsTypePredicate(t.identifier('AddEventListenerOptions')));
            unRemovedListener.node.arguments[2] = updatedOptionsWithType;
        } else {
            unRemovedListener.node.arguments[2] = t.objectPattern([signalObject]);
        }
    }

    // Step 3: Abort in destructor: controller.abort();  (if not already)
    const abortCalls = destructorBody.filter((statement) => t.isExpressionStatement(statement) && statement.expression.callee?.property?.name === 'abort');
    let controllerAlreadyAborted = false;

    if (abortCalls.length) {
        controllerAlreadyAborted = abortCalls.find((abortCall) => generate(abortCall.expression.callee.object).code === generate(abortControllerIdentifier).code);
    }

    if (!abortCalls.length || !controllerAlreadyAborted) {
        let abortStatement = null;
        if (isTypescript) {
            abortStatement = template.ast`
                ${generate(abortControllerIdentifier).code}?.abort()        
            `;
        } else {
            abortStatement = template.ast`
                ${generate(abortControllerIdentifier).code}.abort()
            `;
        }

         destructorBody.push(abortStatement);
         destructorBody.push(template.ast`
            ${generate(abortControllerIdentifier).code} = null;
         `);
    }
};
