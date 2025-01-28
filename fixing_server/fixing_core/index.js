#! /usr/bin/env node
const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const { LeakFactorStats } = require('./LeakFactorStats');

const projectFolderPath = process.argv.slice(2, 3)[0];
const folderName = path.basename(projectFolderPath);
const outputPath = process.argv.slice(3, 4)[0];

const fontStyle = {
    reset: '\x1b[0m',
    underscore: '\x1b[4m',
    green: '\x1b[32m',
    red: '\x1b[31m'
};

if (outputPath && !fs.existsSync(outputPath)) {
    console.log(fontStyle.red, `\nInvalid output location: ${outputPath}\n`, fontStyle.reset);
}

LeakFactorStats.clearLogFiles();

shell.exec(`npx jscodeshift -t ${__dirname}/src/main.js ${projectFolderPath} --extensions=ts,tsx,js,jsx --ignore-config=${__dirname}/.leakIgnore --folderName=${folderName} --verbose=1`);

const filesRefactoredForSubscriptionLeak = LeakFactorStats.getFilesRefactoredForSubscriptionLeak();
const countOfSubscriptionLeaks = LeakFactorStats.getSubscriptionLeaksCount();

const filesRefactoredForEventListenerLeak = LeakFactorStats.getFilesRefactoredForEventListenerLeak();
const countOfEventListenerLeaks = LeakFactorStats.getEventListenerLeaksCount();

const filesRefactoredForTimingEventLeak = LeakFactorStats.getFilesRefactoredForTimingEventLeak();
const countOfTimingEventLeaks = LeakFactorStats.getTimingEventLeaksCount();

const filesRefactoredForCollectionsLeak = LeakFactorStats.getFilesRefactoredForCollectionsLeak();
const countOfCollectionLeaks = LeakFactorStats.getCollectionLeaksCount();

const filesRefactoredForEventAssignmentsLeak = LeakFactorStats.getFilesRefactoredForEventAssignmentsLeak();
const countOfEventAssignmentLeaks = LeakFactorStats.getEventAssignmentLeaksCount();

const filesRefactoredForAnimationFramesLeak = LeakFactorStats.getFilesRefactoredForAnimationFramesLeak();
const countOfAnimationFrameLeaks = LeakFactorStats.getAnimationFrameLeaksCount();

const totalCountOfPotentialLeaks = countOfTimingEventLeaks + countOfSubscriptionLeaks + countOfEventListenerLeaks + countOfCollectionLeaks + countOfEventAssignmentLeaks
    + countOfAnimationFrameLeaks;

const results = {
    memoryLeakFixResults: {
        countOfleaks: {},
        refactoring: {}
    }
};

console.log(fontStyle.green, '\nMemory leak fix results', fontStyle.reset);
console.log(fontStyle.green, '\nRefactored Files', fontStyle.reset);

if (filesRefactoredForSubscriptionLeak.size) {
    console.log(fontStyle.underscore, '\nRefactored for potential subscription leaks', fontStyle.reset);
    console.log(filesRefactoredForSubscriptionLeak);
    results.memoryLeakFixResults.refactoring.filesRefactoredForSubscriptionLeak = [...filesRefactoredForSubscriptionLeak];
}

if (filesRefactoredForTimingEventLeak.size) {
    console.log(fontStyle.underscore, '\nRefactored for potential timing event leaks', fontStyle.reset);
    console.log(filesRefactoredForTimingEventLeak);
    results.memoryLeakFixResults.refactoring.filesRefactoredForTimingEventLeak = [...filesRefactoredForTimingEventLeak];
}

if (filesRefactoredForEventListenerLeak.size) {
    console.log(fontStyle.underscore, '\nRefactored for potential event listener leaks', fontStyle.reset);
    console.log(filesRefactoredForEventListenerLeak);
    results.memoryLeakFixResults.refactoring.filesRefactoredForEventListenerLeak = [...filesRefactoredForEventListenerLeak];
}

if (filesRefactoredForCollectionsLeak.size) {
    console.log(fontStyle.underscore, '\nRefactored for potential collection leaks', fontStyle.reset);
    console.log(filesRefactoredForCollectionsLeak);
    results.memoryLeakFixResults.refactoring.filesRefactoredForCollectionsLeak = [...filesRefactoredForCollectionsLeak];
}

if (filesRefactoredForEventAssignmentsLeak.size) {
    console.log(fontStyle.underscore, '\nRefactored for potential event assignment leaks', fontStyle.reset);
    console.log(filesRefactoredForEventAssignmentsLeak);
    results.memoryLeakFixResults.refactoring.filesRefactoredForEventAssignmentsLeak = [...filesRefactoredForEventAssignmentsLeak];
}

if (filesRefactoredForAnimationFramesLeak.size) {
    console.log(fontStyle.underscore, '\nRefactored for potential animation frame request leaks', fontStyle.reset);
    console.log(filesRefactoredForAnimationFramesLeak);
    results.memoryLeakFixResults.refactoring.filesRefactoredForAnimationFramesLeak = [...filesRefactoredForAnimationFramesLeak];
}

const totalFilesRefactored = new Set([...filesRefactoredForSubscriptionLeak, ...filesRefactoredForEventListenerLeak, ...filesRefactoredForTimingEventLeak, ...filesRefactoredForCollectionsLeak,
    ...filesRefactoredForEventAssignmentsLeak, ...filesRefactoredForAnimationFramesLeak]);
console.log('\nTotal files refactored', fontStyle.green, totalFilesRefactored.size, fontStyle.reset);
results.memoryLeakFixResults.refactoring.totalFilesRefactored = totalFilesRefactored.size;

if (countOfTimingEventLeaks) {
    console.log('\nTotal uncleared timing events detected', fontStyle.green, countOfTimingEventLeaks, fontStyle.reset);
    results.memoryLeakFixResults.countOfleaks.countOfTimingEventLeaks = countOfTimingEventLeaks;
}

if (countOfSubscriptionLeaks) {
    console.log('\nTotal unsubscribed subscriptions detected', fontStyle.green, countOfSubscriptionLeaks, fontStyle.reset);
    results.memoryLeakFixResults.countOfleaks.countOfSubscriptionLeaks = countOfSubscriptionLeaks;
}

if (countOfEventListenerLeaks) {
    console.log('\nTotal unremoved event listeners detected', fontStyle.green, countOfEventListenerLeaks, fontStyle.reset);
    results.memoryLeakFixResults.countOfleaks.countOfEventListenerLeaks = countOfEventListenerLeaks;
}

if (countOfCollectionLeaks) {
    console.log('\nTotal uncleared collections detected', fontStyle.green, countOfCollectionLeaks, fontStyle.reset);
    results.memoryLeakFixResults.countOfleaks.countOfCollectionLeaks = countOfCollectionLeaks;
}

if (countOfEventAssignmentLeaks) {
    console.log('\nTotal invalid assignments to events detected', fontStyle.green, countOfEventAssignmentLeaks, fontStyle.reset);
    results.memoryLeakFixResults.countOfleaks.countOfEventAssignmentLeaks = countOfEventAssignmentLeaks;
}

if (countOfAnimationFrameLeaks) {
    console.log('\nTotal uncancelled animation frame requests detected', fontStyle.green, countOfAnimationFrameLeaks, fontStyle.reset);
    results.memoryLeakFixResults.countOfleaks.countOfAnimationFrameLeaks = countOfAnimationFrameLeaks;
}

console.log('\nTotal count of potential leaks', fontStyle.green, totalCountOfPotentialLeaks, fontStyle.reset, '\n');
results.memoryLeakFixResults.countOfleaks.totalCountOfPotentialLeaks = totalCountOfPotentialLeaks;

if (outputPath && fs.existsSync(outputPath)) {
    const resultsJSON = JSON.stringify(results, null, 4);
    fs.writeFileSync(`${outputPath}/LeakFactorStats.json`, resultsJSON, null, () => {});
}

LeakFactorStats.clearLogFiles();
