import CONSTANTS from '../constants';
import { getUnCancelledRequests, hasAnimationFrameRequests } from '../helperFunctions/trackAnimationFrameRequests';
import { getNewAssignmentDataInFunctionalComponent } from '../helperFunctions/functionalComponentHelpers';
import { getNewAssignmentInClass } from '../helperFunctions/classHelperFunctions';
import { LeakFactorStats } from '../../LeakFactorStats';
import { clearIdentifier, replaceWithAssignmentStatement } from '../helperFunctions/utils';

export const fixAnimationFrameLeaksInFunctionalComponent = (programPath, functionPath, pluginOptions) => {
    if (!hasAnimationFrameRequests(functionPath, CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT)) {
        return;
    }

    const reactFunctionalComponent = CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT;
    const { existingUncancelledRequests, unassignedRequestPaths } = getUnCancelledRequests(programPath, functionPath, pluginOptions.fileExtension, reactFunctionalComponent);

    if (existingUncancelledRequests.length) {
        existingUncancelledRequests.forEach((uncancelledRequest) => {
            clearIdentifier(programPath, functionPath, CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT, CONSTANTS.METHOD_NAMES.CANCEL_ANIMATION_FRAME, uncancelledRequest.id, uncancelledRequest.path);
        });
    }

    if (unassignedRequestPaths.length) {
        const isTypescript = CONSTANTS.TYPESCRIPT_EXTENSIONS.includes(pluginOptions.fileExtension);

        unassignedRequestPaths.forEach((unassignedRequestPaths) => {
            const assignmentData = getNewAssignmentDataInFunctionalComponent(programPath, functionPath, unassignedRequestPaths, isTypescript, 'requestID');
            clearIdentifier(programPath, functionPath, CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT, CONSTANTS.METHOD_NAMES.CANCEL_ANIMATION_FRAME, assignmentData.id, unassignedRequestPaths);
        });
    }

    if (existingUncancelledRequests.length + unassignedRequestPaths.length) {
        LeakFactorStats.addFilesRefactoredForAnimationFramesLeak(pluginOptions.fileName);
        LeakFactorStats.addAnimationFrameLeaksCount(existingUncancelledRequests.length + unassignedRequestPaths.length);
    }
};

export const fixAnimationFrameLeaksInClass = (programPath, currentFramework, classDecPath, pluginOptions) => {
    if (!hasAnimationFrameRequests(classDecPath, CONSTANTS.CONTAINER_TYPES.CLASS, classDecPath.node.id?.name)) {
        return;
    }

    const className = classDecPath.node.id?.name;
    const classBodyPath = classDecPath.get('body');

    const { existingUncancelledRequests, unassignedRequestPaths } = getUnCancelledRequests(programPath, classBodyPath, pluginOptions.fileExtension, CONSTANTS.CONTAINER_TYPES.CLASS, className);

    if (existingUncancelledRequests.length) {
        existingUncancelledRequests.forEach((uncancelledRequest) => {
            clearIdentifier(programPath, classDecPath, CONSTANTS.CONTAINER_TYPES.CLASS, CONSTANTS.METHOD_NAMES.CANCEL_ANIMATION_FRAME, uncancelledRequest.id, null, currentFramework);
        });
    }

    if (unassignedRequestPaths.length) {
        const isTypescript = CONSTANTS.TYPESCRIPT_EXTENSIONS.includes(pluginOptions.fileExtension);

        unassignedRequestPaths.forEach((requestCallPath) => {
            const requestData = {
                type: requestCallPath.node.callee.name,
                ...getNewAssignmentInClass(classBodyPath, isTypescript, className, requestCallPath, 'requestID')
            };

            replaceWithAssignmentStatement(requestCallPath, requestData);
            clearIdentifier(programPath, classDecPath, CONSTANTS.CONTAINER_TYPES.CLASS, CONSTANTS.METHOD_NAMES.CANCEL_ANIMATION_FRAME, requestData.id, null, currentFramework);
        });
    }

    if (existingUncancelledRequests.length + unassignedRequestPaths.length) {
        LeakFactorStats.addFilesRefactoredForAnimationFramesLeak(pluginOptions.fileName);
        LeakFactorStats.addAnimationFrameLeaksCount(existingUncancelledRequests.length + unassignedRequestPaths.length);
    }
};
