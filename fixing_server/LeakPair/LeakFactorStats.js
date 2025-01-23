const fs = require('fs');

const addToRefactoredFiles = (logFileName, parsedFileName) => {
    const logFilePath = `${__dirname}/${logFileName}`;

    if (fs.existsSync(logFilePath)) {
        const currentFileContent = fs.readFileSync(logFilePath, 'utf-8');

        if (!currentFileContent.includes(`${parsedFileName}\n`)) {
            fs.writeFileSync(logFilePath, `${parsedFileName}\n`, { flag: 'a' }, () => {});
        }
    } else {
        fs.writeFileSync(logFilePath, `${parsedFileName}\n`, { flag: 'a' }, () => {});
    }
};

const getFilesRefactoredForLeak = (logFileName) => {
    const logFilePath = `${__dirname}/${logFileName}`;

    const filesRefactoredForLeak = new Set([]);

    if (fs.existsSync(logFilePath)) {
        fs.readFileSync(logFilePath, 'utf-8').split(/\r?\n/).forEach((fileName) => {
            if (fileName) {
                filesRefactoredForLeak.add(fileName);
            }
        });
    }

    return filesRefactoredForLeak;
};

const getLeaksCount = (logFileName) => {
    const logFilePath = `${__dirname}/${logFileName}`;
    let leaksCount = 0;

    if (fs.existsSync(logFilePath)) {
        fs.readFileSync(logFilePath, 'utf-8').split(/\r?\n/).forEach((line) => {
            leaksCount += Number(line);
        });
    }

    return leaksCount;
};

const clearLogFileIfExists = (logFile) => {
    if (fs.existsSync(logFile)) {
        fs.rmSync(logFile);
    }
};

const removeFileNameFromLogFile = (fileName, logFileName) => {
    const logFilePath = `${__dirname}/${logFileName}`;
    const currentFileContent = fs.readFileSync(logFilePath, 'utf-8');
    let updatedContent = 'no update';

    if (currentFileContent.includes(`${fileName}\n`)) {
        updatedContent = currentFileContent.replace(`${fileName}\n`, '');
    }

    if (updatedContent !== 'no update') {
        fs.writeFileSync(logFilePath, updatedContent, 'utf-8');
    }
};

const logFileNames = {
    REFACTORED_FOR_SUBSCRIPTION_LEAKS: 'refactoredForSubscriptionLeak.txt',
    REFACTORED_FOR_TIMING_EVENT_LEAKS: 'refactoredForTimingEventLeak.txt',
    REFACTORED_FOR_EVENT_LISTENER_LEAKS: 'refactoredForEventListenerLeak.txt',
    REFACTORED_FOR_COLLECTION_LEAKS: 'refactoredForCollectionLeak.txt',
    REFACTORED_FOR_EVENT_ASSIGNMENT_LEAKS: 'refactoredForEventAssignmentLeak.txt',
    REFACTORED_FOR_ANIMATION_FRAME_LEAKS: 'refactoredForAnimationFrameLeak.txt',
    SUBSCRIPTION_LEAKS_COUNT: 'subscriptionLeaksCount.txt',
    TIMING_EVENT_LEAKS_COUNT: 'timingEventLeaksCount.txt',
    EVENT_LISTENER_LEAKS_COUNT: 'eventListenerLeaksCount.txt',
    COLLECTION_LEAKS_COUNT: 'collectionLeaksCount.txt',
    EVENT_ASSIGNMENT_LEAKS_COUNT: 'eventAssignmentLeaksCount.txt',
    ANIMATION_FRAME_LEAKS_COUNT: 'animationFrameLeaksCount.txt'
};

class LeakFactorStats {
    static addFilesRefactoredForSubscriptionLeak(parsedFileName) {
        addToRefactoredFiles(logFileNames.REFACTORED_FOR_SUBSCRIPTION_LEAKS, parsedFileName);
    }

    static addFilesRefactoredForTimingEventLeak(parsedFileName) {
        addToRefactoredFiles(logFileNames.REFACTORED_FOR_TIMING_EVENT_LEAKS, parsedFileName);
    }

    static addFilesRefactoredForEventListenerLeak(parsedFileName) {
        addToRefactoredFiles(logFileNames.REFACTORED_FOR_EVENT_LISTENER_LEAKS, parsedFileName);
    }

    static addFilesRefactoredForCollectionsLeak(parsedFileName) {
        addToRefactoredFiles(logFileNames.REFACTORED_FOR_COLLECTION_LEAKS, parsedFileName);
    }

    static addFilesRefactoredForEventAssignmentLeak(parsedFileName) {
        addToRefactoredFiles(logFileNames.REFACTORED_FOR_EVENT_ASSIGNMENT_LEAKS, parsedFileName);
    }

    static addFilesRefactoredForAnimationFramesLeak(parsedFileName) {
        addToRefactoredFiles(logFileNames.REFACTORED_FOR_ANIMATION_FRAME_LEAKS, parsedFileName);
    }

    static getFilesRefactoredForSubscriptionLeak() {
        return getFilesRefactoredForLeak(logFileNames.REFACTORED_FOR_SUBSCRIPTION_LEAKS);
    }

    static getFilesRefactoredForTimingEventLeak() {
        return getFilesRefactoredForLeak(logFileNames.REFACTORED_FOR_TIMING_EVENT_LEAKS);
    }

    static getFilesRefactoredForEventListenerLeak() {
        return getFilesRefactoredForLeak(logFileNames.REFACTORED_FOR_EVENT_LISTENER_LEAKS);
    }

    static getFilesRefactoredForCollectionsLeak() {
        return getFilesRefactoredForLeak(logFileNames.REFACTORED_FOR_COLLECTION_LEAKS);
    }

    static getFilesRefactoredForEventAssignmentsLeak() {
        return getFilesRefactoredForLeak(logFileNames.REFACTORED_FOR_EVENT_ASSIGNMENT_LEAKS);
    }

    static getFilesRefactoredForAnimationFramesLeak() {
        return getFilesRefactoredForLeak(logFileNames.REFACTORED_FOR_ANIMATION_FRAME_LEAKS);
    }

    static addSubscriptionLeaksCount(countToAdd) {
        fs.writeFileSync(`${__dirname}/${logFileNames.SUBSCRIPTION_LEAKS_COUNT}`, `${countToAdd}\n`, { flag: 'a' }, () => {});
    }

    static addTimingEventLeaksCount(countToAdd) {
        fs.writeFileSync(`${__dirname}/${logFileNames.TIMING_EVENT_LEAKS_COUNT}`, `${countToAdd}\n`, { flag: 'a' }, () => {});
    }

    static addEventListenerLeaksCount(countToAdd) {
        fs.writeFileSync(`${__dirname}/${logFileNames.EVENT_LISTENER_LEAKS_COUNT}`, `${countToAdd}\n`, { flag: 'a' }, () => {});
    }

    static addCollectionLeaksCount(countToAdd) {
        fs.writeFileSync(`${__dirname}/${logFileNames.COLLECTION_LEAKS_COUNT}`, `${countToAdd}\n`, { flag: 'a' }, () => {});
    }

    static addEventAssignmentLeaksCount(countToAdd) {
        fs.writeFileSync(`${__dirname}/${logFileNames.EVENT_ASSIGNMENT_LEAKS_COUNT}`, `${countToAdd}\n`, { flag: 'a' }, () => {});
    }

    static addAnimationFrameLeaksCount(countToAdd) {
        fs.writeFileSync(`${__dirname}/${logFileNames.ANIMATION_FRAME_LEAKS_COUNT}`, `${countToAdd}\n`, { flag: 'a' }, () => {});
    }

    static getSubscriptionLeaksCount() {
        return getLeaksCount(logFileNames.SUBSCRIPTION_LEAKS_COUNT);
    }

    static getTimingEventLeaksCount() {
        return getLeaksCount(logFileNames.TIMING_EVENT_LEAKS_COUNT);
    }

    static getEventListenerLeaksCount() {
        return getLeaksCount(logFileNames.EVENT_LISTENER_LEAKS_COUNT);
    }

    static getCollectionLeaksCount() {
        return getLeaksCount(logFileNames.COLLECTION_LEAKS_COUNT);
    }

    static getEventAssignmentLeaksCount() {
        return getLeaksCount(logFileNames.EVENT_ASSIGNMENT_LEAKS_COUNT);
    }

    static getAnimationFrameLeaksCount() {
        return getLeaksCount(logFileNames.ANIMATION_FRAME_LEAKS_COUNT);
    }

    static removeFileFromRefactoredFiles(fileName) {
        if (fs.existsSync(`${__dirname}/${logFileNames.REFACTORED_FOR_SUBSCRIPTION_LEAKS}`)) {
            removeFileNameFromLogFile(fileName, logFileNames.REFACTORED_FOR_SUBSCRIPTION_LEAKS);
        }

        if (fs.existsSync(`${__dirname}/${logFileNames.REFACTORED_FOR_TIMING_EVENT_LEAKS}`)) {
            removeFileNameFromLogFile(fileName, logFileNames.REFACTORED_FOR_TIMING_EVENT_LEAKS);
        }

        if (fs.existsSync(`${__dirname}/${logFileNames.REFACTORED_FOR_EVENT_LISTENER_LEAKS}`)) {
            removeFileNameFromLogFile(fileName, logFileNames.REFACTORED_FOR_EVENT_LISTENER_LEAKS);
        }

        if (fs.existsSync(`${__dirname}/${logFileNames.REFACTORED_FOR_COLLECTION_LEAKS}`)) {
            removeFileNameFromLogFile(fileName, logFileNames.REFACTORED_FOR_COLLECTION_LEAKS);
        }

        if (fs.existsSync(`${__dirname}/${logFileNames.REFACTORED_FOR_EVENT_ASSIGNMENT_LEAKS}`)) {
            removeFileNameFromLogFile(fileName, logFileNames.REFACTORED_FOR_EVENT_ASSIGNMENT_LEAKS);
        }

        if (fs.existsSync(`${__dirname}/${logFileNames.REFACTORED_FOR_ANIMATION_FRAME_LEAKS}`)) {
            removeFileNameFromLogFile(fileName, logFileNames.REFACTORED_FOR_ANIMATION_FRAME_LEAKS);
        }
    }

    static clearLogFiles = () => {
        clearLogFileIfExists(`${__dirname}/${logFileNames.REFACTORED_FOR_SUBSCRIPTION_LEAKS}`);
        clearLogFileIfExists(`${__dirname}/${logFileNames.REFACTORED_FOR_TIMING_EVENT_LEAKS}`);
        clearLogFileIfExists(`${__dirname}/${logFileNames.REFACTORED_FOR_COLLECTION_LEAKS}`);
        clearLogFileIfExists(`${__dirname}/${logFileNames.REFACTORED_FOR_EVENT_LISTENER_LEAKS}`);
        clearLogFileIfExists(`${__dirname}/${logFileNames.REFACTORED_FOR_EVENT_ASSIGNMENT_LEAKS}`);
        clearLogFileIfExists(`${__dirname}/${logFileNames.REFACTORED_FOR_ANIMATION_FRAME_LEAKS}`);
        clearLogFileIfExists(`${__dirname}/${logFileNames.SUBSCRIPTION_LEAKS_COUNT}`);
        clearLogFileIfExists(`${__dirname}/${logFileNames.TIMING_EVENT_LEAKS_COUNT}`);
        clearLogFileIfExists(`${__dirname}/${logFileNames.EVENT_LISTENER_LEAKS_COUNT}`);
        clearLogFileIfExists(`${__dirname}/${logFileNames.COLLECTION_LEAKS_COUNT}`);
        clearLogFileIfExists(`${__dirname}/${logFileNames.EVENT_ASSIGNMENT_LEAKS_COUNT}`);
        clearLogFileIfExists(`${__dirname}/${logFileNames.ANIMATION_FRAME_LEAKS_COUNT}`);
    };
}

module.exports = { LeakFactorStats };
