import CONSTANTS from '../constants';
import { hasSetTimers, getUnClearedTimers } from '../helperFunctions/trackSetTimers';
import { getNewAssignmentDataInFunctionalComponent } from '../helperFunctions/functionalComponentHelpers';
import { getNewAssignmentInClass } from '../helperFunctions/classHelperFunctions';
import { LeakFactorStats } from '../../LeakFactorStats';
import { clearIdentifier } from '../helperFunctions/utils';

export const fixTimerLeaksInFunctionalComponent = (programPath, functionPath, pluginOptions) => {
    if (!hasSetTimers(functionPath, CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT)) {
        return;
    }

    const reactFunctionalComponent = CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT;
    const { existingUnclearedTimers, unassignedTimers } = getUnClearedTimers(programPath, functionPath, pluginOptions.fileExtension, reactFunctionalComponent);

    if (existingUnclearedTimers.length) {
        existingUnclearedTimers.forEach((unclearedTimer) => {
            const clearMethodName = (unclearedTimer.type === CONSTANTS.TIMER_TYPES.INTERVAL) ? CONSTANTS.METHOD_NAMES.CLEAR_INTERVAL[1] : CONSTANTS.METHOD_NAMES.CLEAR_TIMEOUT[1];
            clearIdentifier(programPath, functionPath, CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT, clearMethodName, unclearedTimer.id, unclearedTimer.path);
        });
    }

    if (unassignedTimers.length) {
        const isTypescript = CONSTANTS.TYPESCRIPT_EXTENSIONS.includes(pluginOptions.fileExtension);

        unassignedTimers.forEach((unassignedTimer) => {
            const clearMethodName = (unassignedTimer.type === CONSTANTS.TIMER_TYPES.INTERVAL) ? CONSTANTS.METHOD_NAMES.CLEAR_INTERVAL[1] : CONSTANTS.METHOD_NAMES.CLEAR_TIMEOUT[1];
            const identifierName = (unassignedTimer.type === CONSTANTS.TIMER_TYPES.INTERVAL) ? 'intervalID' : 'timeOutID';
            const assignmentData = getNewAssignmentDataInFunctionalComponent(programPath, functionPath, unassignedTimer.path, isTypescript, identifierName);
            clearIdentifier(programPath, functionPath, CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT, clearMethodName, assignmentData.id, unassignedTimer.path);
        });
    }

    if (existingUnclearedTimers.length + unassignedTimers.length) {
        LeakFactorStats.addFilesRefactoredForTimingEventLeak(pluginOptions.fileName);
        LeakFactorStats.addTimingEventLeaksCount(existingUnclearedTimers.length + unassignedTimers.length);
    }
};

export const fixTimerLeaksInClass = (programPath, currentFramework, classDecPath, pluginOptions) => {
    if (!hasSetTimers(classDecPath, CONSTANTS.CONTAINER_TYPES.CLASS, classDecPath.node.id?.name)) {
        return;
    }

    const className = classDecPath.node.id?.name;
    const classBodyPath = classDecPath.get('body');

    const { existingUnclearedTimers, unassignedTimers } = getUnClearedTimers(programPath, classBodyPath, pluginOptions.fileExtension, CONSTANTS.CONTAINER_TYPES.CLASS, className);

    if (existingUnclearedTimers.length) {
        existingUnclearedTimers.forEach((unclearedTimer) => {
            const clearMethodName = (unclearedTimer.type === CONSTANTS.TIMER_TYPES.INTERVAL) ? CONSTANTS.METHOD_NAMES.CLEAR_INTERVAL[1] : CONSTANTS.METHOD_NAMES.CLEAR_TIMEOUT[1];
            clearIdentifier(programPath, classDecPath, CONSTANTS.CONTAINER_TYPES.CLASS, clearMethodName, unclearedTimer.id, null, currentFramework);
        });
    }

    if (unassignedTimers.length) {
        const isTypescript = CONSTANTS.TYPESCRIPT_EXTENSIONS.includes(pluginOptions.fileExtension);

        unassignedTimers.forEach((unassignedTimer) => {
            const identifierName = (unassignedTimer.type === CONSTANTS.TIMER_TYPES.INTERVAL) ? 'intervalID' : 'timeOutID';
            const assignmentData = getNewAssignmentInClass(classBodyPath, isTypescript, className, unassignedTimer.path, identifierName);
            const clearMethodName = (unassignedTimer.type === CONSTANTS.TIMER_TYPES.INTERVAL) ? CONSTANTS.METHOD_NAMES.CLEAR_INTERVAL[1] : CONSTANTS.METHOD_NAMES.CLEAR_TIMEOUT[1];
            clearIdentifier(programPath, classDecPath, CONSTANTS.CONTAINER_TYPES.CLASS, clearMethodName, assignmentData.id, null, currentFramework);
        });
    }

    if (existingUnclearedTimers.length + unassignedTimers.length) {
        LeakFactorStats.addFilesRefactoredForTimingEventLeak(pluginOptions.fileName);
        LeakFactorStats.addTimingEventLeaksCount(existingUnclearedTimers.length + unassignedTimers.length);
    }
};
