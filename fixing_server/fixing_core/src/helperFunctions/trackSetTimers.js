import * as t from '@babel/types';
import generate from '@babel/generator';
import CONSTANTS from '../constants';
import { getExistingClassDestructor, isInsideNestedFunctionInNamelessClass } from './classHelperFunctions';
import { getAssignedIdentifier, updateIdForIncorrectAssignment, getClearedIdentifiersInMethod } from './utils';
import { getExistingFunctionalComponentDestructors } from './functionalComponentHelpers';

export const hasSetTimers = (containerPath, containerType, className) => {
    let hasTimers = false;

    containerPath.traverse({
        CallExpression(callPath) {
            if (isAssignableTimer(callPath, containerType, className)) {
                hasTimers = true;
                callPath.stop();
            }
        }
    });

    return hasTimers;
};

export const isAssignableTimer = (timerCallPath, containerType, className) => {
    const calleeName = timerCallPath.node.callee.property?.name || timerCallPath.node.callee.name;

    if (calleeName && (CONSTANTS.METHOD_NAMES.SET_INTERVAL.includes(calleeName) || CONSTANTS.METHOD_NAMES.SET_TIMEOUT.includes(calleeName))) {
        // Returned timers and timers passed as function arguments are not assignable
        // Specifically, if a timer is returned, currently there is no way to detect where the returned value is used (& cleared)
        if (t.isCallExpression(timerCallPath.parent) || t.isReturnStatement(timerCallPath.parent)) {
            return false;
        }

         // Ignoring timers in nested functions in nameless classes
        if (isInsideNestedFunctionInNamelessClass(containerType, className, timerCallPath)) {
            return false;
        }

        return true;
    }

    return false;
};

export const getUnClearedTimers = (programPath, containerPath, fileExtension, containerType, className) => {
    const existingTimers = [];
    let existingUnclearedTimers = [];
    const unassignedTimers = [];

    containerPath.traverse({
        CallExpression(callPath) {
            if (isAssignableTimer(callPath)) {
                const callee = callPath.node.callee.property ? callPath.node.callee.property.name : callPath.node.callee.name;
                const timerID = getAssignedIdentifier(callPath);
                const type = (CONSTANTS.METHOD_NAMES.SET_TIMEOUT.includes(callee)) ? CONSTANTS.TIMER_TYPES.TIME_OUT : CONSTANTS.TIMER_TYPES.INTERVAL;
                const timerName = (CONSTANTS.METHOD_NAMES.SET_TIMEOUT.includes(callee)) ? 'timeOutID' : 'intervalID';

                if (timerID) {
                    const validID = updateIdForIncorrectAssignment(programPath, containerPath, fileExtension, containerType, callPath, timerID, className, timerName);
                    existingTimers.push({ path: callPath, type, id: validID });
                } else {
                    unassignedTimers.push({ path: callPath, type });
                }
            }
        }
    });

    if (existingTimers.length) {
        existingUnclearedTimers = existingTimers;
        let clearedTimerIDs = [];

        if (containerType === CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT) {
            const destructors = getExistingFunctionalComponentDestructors(containerPath);

            if (destructors.length) {
                const totalClearedTimers = [];

                destructors.forEach((destructor) => {
                    const clearedTimersInDestructor = getClearedTimers(containerPath, destructor.path);
                    clearedTimersInDestructor.length && totalClearedTimers.push(...clearedTimersInDestructor);
                });

                clearedTimerIDs = totalClearedTimers;
            }
        } else {
            const { path } = getExistingClassDestructor(containerPath);

            if (path) {
                clearedTimerIDs = getClearedTimers(containerPath, path);
            }
        }

        if (clearedTimerIDs?.length) {
            existingUnclearedTimers = existingTimers.filter((setTimer) => clearedTimerIDs.every((clearedTimerID) => {
                return !(generate(clearedTimerID).code.includes(generate(setTimer.id).code));
            }));
        }
    }

    return {
        existingUnclearedTimers: existingUnclearedTimers || [],
        unassignedTimers: unassignedTimers || []
    };
};

const getClearedTimers = (containerPath, destructorPath) => {
    const clearedTimerIDs = [];

    const clearTimerVisitor = {
        CallExpression(callPath) {
            const { node } = callPath;
            const callee = generate(node.callee).code;

            if ((CONSTANTS.METHOD_NAMES.CLEAR_TIMEOUT.includes(callee) || CONSTANTS.METHOD_NAMES.CLEAR_INTERVAL.includes(callee))) {
                // Is a clear timer statement and cleared is not inside a conditional block and clear the same id{
                clearedTimerIDs.push(node.arguments?.[0]);
            } else {
                const methodCalledInDestructor = generate(callPath.node.callee.property ? callPath.node.callee.property : callPath.node.callee).code;
                // If timer was removed in destructor via function call

                const clearedTimersInMethod = getClearedIdentifiersInMethod(containerPath, methodCalledInDestructor, [...CONSTANTS.METHOD_NAMES.CLEAR_INTERVAL, ...CONSTANTS.METHOD_NAMES.CLEAR_TIMEOUT]);
                clearedTimersInMethod.length && clearedTimerIDs.push(...clearedTimersInMethod);
            }
        }
    };

    if (Array.isArray(destructorPath)) {
        destructorPath.forEach((path) => {
            path.traverse(clearTimerVisitor);
        });
    } else {
        destructorPath.traverse(clearTimerVisitor);
    }

    return clearedTimerIDs;
};
