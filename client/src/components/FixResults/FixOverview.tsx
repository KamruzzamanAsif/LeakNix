import OverviewCard from "./OverviewCards";
import PieChartCard from "./PieChartCard";

interface MemoryLeakFixResults {
    memoryLeakFixResults: {
      countOfleaks?: {
        countOfAnimationFrameLeaks?: number;
        countOfEventAssignmentLeaks?: number;
        countOfCollectionLeaks?: number;
        countOfTimingEventLeaks?: number;
        countOfEventListenerLeaks?: number;
        countOfSubscriptionLeaks?: number;
        totalCountOfPotentialLeaks?: number;
      };
      refactoring?: {
        filesRefactoredForAnimationFrameLeaks?: string[];
        filesRefactoredForEventAssignmentLeaks?: string[];
        filesRefactoredForCollectionLeaks?: string[];
        filesRefactoredForEventListenerLeak?: string[];
        filesRefactoredForTimingEventLeak?: string[];
        filesRefactoredForSubscriptionLeaks?: string[];
        totalFilesRefactored?: number;
        totalFilesScanned?: number;
      };
    };
}

const FixOverview = ({data}) => {
    const { memoryLeakFixResults } = data;
    console.log("Received: ", memoryLeakFixResults);
    
    // Safely extract counts of leaks with default fallbacks
    const countOfAnimationFrameLeaks = memoryLeakFixResults?.countOfleaks?.countOfAnimationFrameLeaks ?? 0;
    const countOfEventAssignmentLeaks = memoryLeakFixResults?.countOfleaks?.countOfEventAssignmentLeaks ?? 0;
    const countOfCollectionLeaks = memoryLeakFixResults?.countOfleaks?.countOfCollectionLeaks ?? 0;
    const countOfTimingEventLeaks = memoryLeakFixResults?.countOfleaks?.countOfTimingEventLeaks ?? 0;
    const countOfEventListenerLeaks = memoryLeakFixResults?.countOfleaks?.countOfEventListenerLeaks ?? 0;
    const countOfSubscriptionLeaks = memoryLeakFixResults?.countOfleaks?.countOfSubscriptionLeaks ?? 0;
    const totalCountOfPotentialLeaks = memoryLeakFixResults?.countOfleaks?.totalCountOfPotentialLeaks ?? 0;

    // Safely extract refactoring details with default fallbacks
    const filesRefactoredForAnimationFrameLeaks = memoryLeakFixResults?.refactoring?.filesRefactoredForAnimationFrameLeaks ?? [];
    const filesRefactoredForEventAssignmentLeaks = memoryLeakFixResults?.refactoring?.filesRefactoredForEventAssignmentLeaks ?? [];
    const filesRefactoredForCollectionLeaks = memoryLeakFixResults?.refactoring?.filesRefactoredForCollectionLeaks ?? [];
    const filesRefactoredForEventListenerLeak = memoryLeakFixResults?.refactoring?.filesRefactoredForEventListenerLeak ?? [];
    const filesRefactoredForTimingEventLeak = memoryLeakFixResults?.refactoring?.filesRefactoredForTimingEventLeak ?? [];
    const filesRefactoredForSubscriptionLeaks = memoryLeakFixResults?.refactoring?.filesRefactoredForSubscriptionLeaks ?? [];
    const totalFilesRefactored = memoryLeakFixResults?.refactoring?.totalFilesRefactored ?? 0;
    const totalFilesScanned = memoryLeakFixResults?.refactoring?.totalFilesScanned ?? 0;
    const percentageOfLeakFiles = (totalFilesRefactored/totalFilesScanned);
    const percentageString = `${percentageOfLeakFiles} %`;

    // Create pieData based on the leak counts
    const pieData = [
        { id: 0, value: countOfAnimationFrameLeaks, label: 'Animation Frame Leaks' },
        { id: 1, value: countOfEventAssignmentLeaks, label: 'Event Assignment Leaks' },
        { id: 2, value: countOfCollectionLeaks, label: 'Collection Leaks' },
        { id: 3, value: countOfTimingEventLeaks, label: 'Timing Event Leaks' },
        { id: 4, value: countOfEventListenerLeaks, label: 'Event Listener Leaks' },
        { id: 5, value: countOfSubscriptionLeaks, label: 'Subscription Leaks' }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'stretch', margin: '1rem', paddingLeft: "4rem" }}>
          {/* Left Side - Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minHeight: '100%', paddingTop: "0.5rem" }}>
            <div style={{ minWidth: '300px', maxWidth: '100%' }}>
              <OverviewCard title="Total Files Scanned" data={totalFilesScanned ?? 0} />
            </div>
            <div style={{ minWidth: '300px', maxWidth: '100%' }}>
              <OverviewCard title="Total Files Refactored" data={totalFilesRefactored ?? 0} />
            </div>
            <div style={{ minWidth: '300px', maxWidth: '100%' }}>
              <OverviewCard title="Total Potential Leaks" data={totalCountOfPotentialLeaks} />
            </div>
            <div style={{ minWidth: '300px', maxWidth: '100%' }}>
              <OverviewCard title="Files Containing Leaks" data={percentageString} />
            </div>
          </div>
      
          {/* Right Side - Pie Chart */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'stretch',
              minHeight: '100%',
            }}
          >
            <div style={{ width: '80%', height: '50%' }}>
              <PieChartCard title="Leak Distribution" data={pieData} />
            </div>
          </div>
        </div>
      );
      
}

export default FixOverview;