import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import { getUnclearedCollections, hasCollectionVariables } from '../helperFunctions/trackCollections';
import { LeakFactorStats } from '../../LeakFactorStats';
import { getClassDestructor } from '../helperFunctions/classHelperFunctions';
import { getFunctionName, getFunctionalComponentDestructor } from '../helperFunctions/functionalComponentHelpers';
import CONSTANTS from '../constants';

const clearCollections = (collections, destructorPath, destructorBody) => {
    collections.forEach((collection) => {
        // const collectionAlreadyCleared = isCollectionCleared(collection.path.node, destructorPath);
        let clearCollectionStatement = null;
        let collectionReference = null;

        if (collection.path.isFunction()) {
            const collectionReferenceNode = t.memberExpression(t.thisExpression(), t.identifier(getFunctionName(collection.path)));
            collectionReference = generate(collectionReferenceNode).code;
        } else if (collection.path.isClassProperty()) {
            collectionReference = t.memberExpression(t.thisExpression(), t.identifier(collection.path.node.key?.name));
        } else {
            collectionReference = collection.path.node.id.name;
        }

        if (collection.type === 'Array') {
            clearCollectionStatement = template.ast`
                if (${collectionReference} && ${collectionReference}.length) {
                    ${collectionReference}.splice(0, ${collectionReference}.length);
                }`;
        } else if (collection.type === 'AngularQueryList') {
            clearCollectionStatement = template.ast`${collectionReference}?.destroy()`;
        } else {
            clearCollectionStatement = template.ast`${collectionReference}?.clear()`; // for sets
        }

        destructorBody.push(clearCollectionStatement);
    });
};

export const fixCollectionLeaksInFunctionalComponent = (programPath, functionPath, pluginOptions) => {
    if (!hasCollectionVariables(programPath)) {
        return;
    }

    const unClearedCollections = getUnclearedCollections(programPath, functionPath, CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT);

    if (unClearedCollections?.length) {
        const { destructorPath, destructorBody } = getFunctionalComponentDestructor(programPath, functionPath);
        clearCollections(unClearedCollections, destructorPath, destructorBody);

        LeakFactorStats.addFilesRefactoredForCollectionsLeak(pluginOptions.fileName);
        LeakFactorStats.addCollectionLeaksCount(unClearedCollections.length);
    }
};

export const fixCollectionLeaksInClass = (programPath, currentFramework, classDecPath, pluginOptions) => {
    if (!hasCollectionVariables(programPath, classDecPath)) {
        return;
    }

    const unClearedCollections = getUnclearedCollections(programPath, classDecPath, CONSTANTS.CONTAINER_TYPES.CLASS);

    if (unClearedCollections?.length) {
        const { destructorPath, destructorBody } = getClassDestructor(programPath, classDecPath, currentFramework);
        clearCollections(unClearedCollections, destructorPath, destructorBody);

        LeakFactorStats.addFilesRefactoredForCollectionsLeak(pluginOptions.fileName);
        LeakFactorStats.addCollectionLeaksCount(unClearedCollections.length);
    }
};
