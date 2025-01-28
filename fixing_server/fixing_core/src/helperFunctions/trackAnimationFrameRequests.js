/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import * as t from '@babel/types';
import generate from '@babel/generator';
import CONSTANTS from '../constants';
import { getExistingClassDestructor, isInsideNestedFunctionInNamelessClass } from './classHelperFunctions';
import { getAssignedIdentifier, updateIdForIncorrectAssignment, getClearedIdentifiersInMethod, } from './utils';
import { getExistingFunctionalComponentDestructors } from './functionalComponentHelpers';

export const hasAnimationFrameRequests = (containerPath, containerType, className) => {
    let hasAnimationFrameRequests = false;

    containerPath.traverse({
        CallExpression(callPath) {
            if (isAssignableFrameRequest(callPath, containerType, className)) {
                hasAnimationFrameRequests = true;
                callPath.stop();
            }
        }
    });

    return hasAnimationFrameRequests;
};

export const isAssignableFrameRequest = (requestCallPath, containerType, className) => {
    const calleeName = requestCallPath.node.callee.property?.name || requestCallPath.node.callee.name;

    if (calleeName && calleeName === CONSTANTS.METHOD_NAMES.REQUEST_ANIMATION_FRAME) {
        // Returned requests and requests passed as function arguments are not assignable
        if (t.isCallExpression(requestCallPath.parent)) {
            return false;
        }

         // Ignoring requests in nested functions in nameless classes
        if (isInsideNestedFunctionInNamelessClass(containerType, className, requestCallPath)) {
            return false;
        }

        return true;
    }

    return false;
};

export const getUnCancelledRequests = (programPath, containerPath, fileExtension, containerType, className) => {
    const existingRequestIDs = [];
    let existingUncancelledRequests = [];
    const unassignedRequests = [];

    containerPath.traverse({
        CallExpression(callPath) {
            if (isAssignableFrameRequest(callPath)) {
                const requestID = getAssignedIdentifier(callPath);

                if (requestID) {
                    const validID = updateIdForIncorrectAssignment(programPath, containerPath, fileExtension, containerType, callPath, requestID, className, 'requestID');
                    existingRequestIDs.push({ path: callPath, id: validID });
                } else {
                    unassignedRequests.push(callPath);
                }
            }
        }
    });

    if (existingRequestIDs.length) {
        existingUncancelledRequests = existingRequestIDs;
        let cancelledRequestIDs = [];

        if (containerType === CONSTANTS.CONTAINER_TYPES.REACT_FUNCTIONAL_COMPONENT) {
            const destructors = getExistingFunctionalComponentDestructors(containerPath);

            if (destructors.length) {
                const totalClearedRequestIDs = [];

                destructors.forEach((destructor) => {
                    const clearedTimersInDestructor = getCancelledRequests(containerPath, destructor.path);
                    clearedTimersInDestructor.length && totalClearedRequestIDs.push(...clearedTimersInDestructor);
                });

                cancelledRequestIDs = totalClearedRequestIDs;
            }
        } else {
            const { path } = getExistingClassDestructor(containerPath);

            if (path) {
                cancelledRequestIDs = getCancelledRequests(containerPath, path);
            }
        }

        if (cancelledRequestIDs?.length) {
            existingUncancelledRequests = existingRequestIDs.filter((request) => cancelledRequestIDs.every((cancelledRequestID) => {
                return !(generate(cancelledRequestID).code.includes(generate(request.id).code));
            }));
        }
    }

    return {
        existingUncancelledRequests: existingUncancelledRequests || [],
        unassignedRequestPaths: unassignedRequests || []
    };
};

const getCancelledRequests = (containerPath, destructorPath) => {
    const cancelledRequestIDs = [];

    const clearRequestVisitor = {
        CallExpression(callPath) {
            const { node } = callPath;

            if (CONSTANTS.METHOD_NAMES.CANCEL_ANIMATION_FRAME.includes(node.callee.name)) {
                cancelledRequestIDs.push(node.arguments?.[0]);
            } else {
                const methodCalledInDestructor = generate(callPath.node.callee.property ? callPath.node.callee.property : callPath.node.callee).code;
                // If request was removed in destructor via function call

                const cancelledRequestsInMethod = getClearedIdentifiersInMethod(containerPath, methodCalledInDestructor, CONSTANTS.METHOD_NAMES.CANCEL_ANIMATION_FRAME);
                cancelledRequestsInMethod.length && cancelledRequestIDs.push(...cancelledRequestsInMethod);
            }
        }
    };

    if (Array.isArray(destructorPath)) {
        // For functional component destructors
        destructorPath.forEach((path) => {
            path.traverse(clearRequestVisitor);
        });
    } else {
        // for single class destructor
        destructorPath.traverse(clearRequestVisitor);
    }

    return cancelledRequestIDs;
};
