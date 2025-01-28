/* eslint-disable import/no-cycle */
import * as t from '@babel/types';
import CONSTANTS from '../constants';
import { importSpecifierFromSource, isSpecifierImported } from './utils';

export default function (programPath, classDeclarationPath, classBody) {
    const onDestroyHookSpecifier = CONSTANTS.IMPORTED_SPECIFIERS.ON_DESTROY_HOOK;
    const classDeclaration = classDeclarationPath.node;

    // If implements exists, check for OnDestrory
    if (classDeclaration.implements) {
        const implementsOnDestroy = classDeclaration.implements.some((hook) => (hook.expression?.name === onDestroyHookSpecifier));

        // If OnDestroy hook does not exist in implements, create and push to existing
        if (!implementsOnDestroy) {
            const onDestroyHook = t.classImplements(t.identifier(onDestroyHookSpecifier));
            classDeclaration.implements.push(onDestroyHook);
        }
    } else {
        const implementsOnDestroy = {
            implements: [t.classImplements(t.identifier(onDestroyHookSpecifier))]
        };
        Object.assign(classDeclaration, implementsOnDestroy);
    }

    const onDestroyHookImportExists = isSpecifierImported(programPath, onDestroyHookSpecifier, CONSTANTS.IMPORT_SOURCES.ANGULAR_CORE);
    const hostListenerImportExists = isSpecifierImported(programPath, 'HostListener', CONSTANTS.IMPORT_SOURCES.ANGULAR_CORE);

    if (!onDestroyHookImportExists) {
        // Angular core imports does not contain OnDestroy(): push OnDestroy hook to existing import
        importSpecifierFromSource(programPath, CONSTANTS.IMPORT_SOURCES.ANGULAR_CORE, onDestroyHookSpecifier, CONSTANTS.IMPORT_KINDS.VALUE);
    }

    if (!hostListenerImportExists) {
        // Angular core imports does not contain OnDestroy(): push OnDestroy hook to existing import
        importSpecifierFromSource(programPath, CONSTANTS.IMPORT_SOURCES.ANGULAR_CORE, 'HostListener', CONSTANTS.IMPORT_KINDS.VALUE);
    }

    // if (classDeclaration.superClass) {}
    let ngOnDestroyMethodAST = t.classMethod(CONSTANTS.NODE_KINDS.METHOD, t.identifier(CONSTANTS.METHOD_NAMES.NG_ON_DESTROY), [], t.blockStatement([]));

    ngOnDestroyMethodAST = Object.assign(ngOnDestroyMethodAST, {
        accessibility: CONSTANTS.ACCESSIBILITY.PUBLIC,
        returnType: t.typeAnnotation(t.voidTypeAnnotation()),
        decorators: [t.decorator(t.callExpression(t.identifier('HostListener'), [t.stringLiteral('unloaded')]))]
    });

    classBody.push(ngOnDestroyMethodAST);
}
