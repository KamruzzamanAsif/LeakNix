import { Card } from '../Form/CardV4';
import colors from '../../styles/colors';
import PatchTable from './PatchTable';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const cardStyles = `
  small { 
    margin-top: 1rem; 
    opacity: 0.5; 
  }
  margin-bottom: 1rem;
  margin-left: 2.7rem;
  width: 95%;
  text-align: center;
  a {
    color: ${colors.textColor};
    text-decoration: none; /* Avoid underline by default */
  }

  details {
    display: flex;
    flex-direction: column; /* Stack content vertically */
    transition: all 0.2s ease-in-out;

    h3 {
      display: inline-block;
      margin: 0;
    }

    summary {
      padding: 0;
      margin: 1rem 0 0 0;
      cursor: pointer;
      font-weight: bold;
    }

    summary:before {
      content: "►";
      margin-right: 0.5rem;
      color: ${colors.primary};
      cursor: pointer;
      transition: transform 0.2s ease-in-out;
    }

    &[open] summary:before {
      content: "▼";
    }
  }
`;

const customTheme = createTheme({
  palette: {
    mode: 'dark', // Dark mode
    primary: {
      main: '#00A2FF', // Accent color
    },
    background: {
      default: '#21222C', // Background color
      paper: '#21222C', // Background color for components like cards
    },
    text: {
      primary: '#68FF8E', // Foreground color
      secondary: '#50F178', // Cell text color
    },
    divider: '#429356', // Border color
  },
  typography: {
    fontFamily: 'IBM Plex Mono, monospace', // Font family
    fontSize: 12, // Base font size
    h6: {
      fontSize: 14, // Header font size
      fontWeight: 700, // Header font weight
    },
  },
  components: {
    MuiTable: {
      styleOverrides: {
        root: {
          border: '1px solid #429356', // Wrapper border
          borderRadius: 0, // Wrapper border radius
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: '1px solid #429356', // Cell border
          padding: '8px 16px', // Cell padding
          fontSize: 14, // Base font size
        },
        head: {
          backgroundColor: '#21222C', // Header background color
          color: '#68FF8E', // Header text color
          fontWeight: 700, // Header font weight
          fontSize: 16, // Header font size
          padding: '12px 16px', // Header padding
          justifyContent: 'center',
          justifyItems: 'center',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: '#21222C', // Row background color
          '&:nth-of-type(odd)': {
            backgroundColor: '#21222C', // Odd row background color
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Button border radius
        },
        containedPrimary: {
          backgroundColor: '#00A2FF', // Primary button background color
          color: '#21222C', // Primary button text color
        },
        outlinedError: {
          borderColor: '#FF0000', // Error button border color
          color: '#FF0000', // Error button text color
        },
      },
    },
  },
});

const processDiffs = (memoryLeakFixResults: any, diffs: any): any => {
  const refactoring = memoryLeakFixResults.memoryLeakFixResults.refactoring || {};
  // Clean filenames by removing the "fixed_code\\" prefix
  const cleanFilename = (filename: string) => filename.replace(/^fixed_code\\/, '');

  // Map of patch tags to their corresponding file arrays (with cleaned filenames)
  const patchTagMap = {
    animationFramePatch: (refactoring.filesRefactoredForAnimationFrameLeaks || []).map(cleanFilename),
    eventAssignmentPatch: (refactoring.filesRefactoredForEventAssignmentLeaks || []).map(cleanFilename),
    collectionPatch: (refactoring.filesRefactoredForCollectionLeaks || []).map(cleanFilename),
    eventListenerPatch: (refactoring.filesRefactoredForEventListenerLeak || []).map(cleanFilename),
    timingEventPatch: (refactoring.filesRefactoredForTimingEventLeak || []).map(cleanFilename),
    subscriptionPatch: (refactoring.filesRefactoredForSubscriptionLeaks || []).map(cleanFilename),
  };

  return diffs.map(diff => {
    // Find the patch tag for the current file
    const patchTag = Object.entries(patchTagMap).find(([_, files]) =>
      files.includes(diff.filename)
    )?.[0] || 'unknownPatch'; // Default to 'unknownPatch' if no match is found

    return {
      filename: diff.filename,
      patchTag,
      diffJson: diff.diffJson,
      rawDiff: diff.rawDiff,
      fullCode: diff.fullCode,
      status: 'Pending', // Initial status
    };
  });
};

const PatchTableCard = (props: { title: string, fixResult: any, diffData: any }): JSX.Element => {
  const processedPatch = processDiffs(props.fixResult, props.diffData);

  return (
    <Card heading={props.title} styles={cardStyles}>
      <ThemeProvider theme={customTheme}>
        <PatchTable data={processedPatch} />
      </ThemeProvider>
    </Card>
  );
};

export default PatchTableCard;