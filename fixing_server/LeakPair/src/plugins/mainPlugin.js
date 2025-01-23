/* eslint-disable no-else-return */
import CONSTANTS from '../constants';
import { isReactFunctionalComponent, isInReactFunctionalComponent, isCustomHook, getFunctionName } from '../helperFunctions/functionalComponentHelpers';
import { getFramework } from '../helperFunctions/utils';
import { fixEventListenerLeaksInFunctionalComponent, fixEventListenerLeaksInClass } from './eventListenersLeakFix'; 
import { fixCollectionLeaksInClass, fixCollectionLeaksInFunctionalComponent } from './collectionsLeakFix';
import { fixStateUpdateLeaksInClass } from './stateUpdateLeakFix';
import { fixTimerLeaksInClass, fixTimerLeaksInFunctionalComponent } from './setTimersLeakFix';
import { fixSubscriptionLeaksInClass } from './subscriptionsLeakFix';
import { fixEventsAssignmentLeaksInFunctionalComponent, fixEventsAssignmentLeaksInClass } from './eventAssignmentsLeakFix';
import { isDecoratedAngularClass, isReactClass } from '../helperFunctions/classHelperFunctions';
import { fixUrlChangeListenerLeaksInClass } from './urlChangeListenersLeakFix';
import { fixRendererListenerLeaksInClass } from './rendererListenersLeakFix';
import { fixAnimationFrameLeaksInFunctionalComponent, fixAnimationFrameLeaksInClass } from './animationFramesLeakFix';

export default function (babel, pluginOptions) {
    let programPath = null;
    let currentFramework = null;

    return {
        visitor: {
            Program(_programPath) {
                currentFramework = getFramework(_programPath);

                if (!currentFramework) {
                    _programPath.stop();
                }

                programPath = _programPath;
            },
            Function(functionPath) {
                if (currentFramework !== CONSTANTS.FRAMEWORKS.REACT) {
                    return;
                }

                if (isReactFunctionalComponent(functionPath) || isCustomHook(functionPath)) {
                    fixEventListenerLeaksInFunctionalComponent(programPath, functionPath, pluginOptions);
                    fixTimerLeaksInFunctionalComponent(programPath, functionPath, pluginOptions);
                    fixAnimationFrameLeaksInFunctionalComponent(programPath, functionPath, pluginOptions);
                    fixEventsAssignmentLeaksInFunctionalComponent(programPath, functionPath, pluginOptions);
                }
            },
            // For React Class Components and Angular Components/Services
            ClassDeclaration(classDecPath) {
                if (isInReactFunctionalComponent(classDecPath)) {
                    return;
                }

                if (isReactClass(classDecPath)) {
                    currentFramework = CONSTANTS.FRAMEWORKS.REACT;
                } else if (isDecoratedAngularClass(programPath, classDecPath)) {
                    currentFramework = CONSTANTS.FRAMEWORKS.ANGULAR;
                } else {
                    return;
                }

                fixEventListenerLeaksInClass(programPath, currentFramework, classDecPath, pluginOptions);
                fixTimerLeaksInClass(programPath, currentFramework, classDecPath, pluginOptions);
                fixAnimationFrameLeaksInClass(programPath, currentFramework, classDecPath, pluginOptions);
                fixEventsAssignmentLeaksInClass(programPath, classDecPath, pluginOptions);
                fixSubscriptionLeaksInClass(programPath, currentFramework, classDecPath, pluginOptions);

                // fixUrlChangeListenerLeaksInClass(programPath, currentFramework, classDecPath);
                // fixStateUpdateLeaksInClass(classDecPath, currentFramework, pluginOptions);
                // fixRendererListenerLeaksInClass(programPath, currentFramework, classDecPath, pluginOptions);
                classDecPath.skip();
            }
        }
    };
}
