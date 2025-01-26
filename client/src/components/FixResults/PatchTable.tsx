import { useMemo, useState } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { Box, Button, Chip, Modal, Typography } from '@mui/material';
import DiffViewer from './DiffViewer'; // Replace with your diff viewer component
import CustomButton from '../Form/CustomButton';
import colors from '../../styles/colors';

// PatchTable component that accepts `data` as props
export const PatchTable = ({ data = [] }) => {
  const [localData, setLocalData] = useState(data); // Local state for data
  const [selectedDiff, setSelectedDiff] = useState<{ filename: string; rawDiff: string } | null>(null); // Track selected diff for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility

  // Handle approve action
  const handleApprove = (filename: string) => {
    setLocalData((prev) =>
      prev.map((patch) =>
        patch.filename === filename ? { ...patch, status: 'Accepted' } : patch,
      ),
    );
  };

  // Handle reject action
  const handleReject = (filename: string) => {
    setLocalData((prev) =>
      prev.map((patch) =>
        patch.filename === filename ? { ...patch, status: 'Rejected' } : patch,
      ),
    );
  };

  // Handle view details action
  const handleViewDetails = (filename: string, rawDiff: string) => {
    setSelectedDiff({ filename, rawDiff });
    setIsModalOpen(true);
  };

  // Handle apply patches action
  // const handleApplyPatches = () => {
  //   const rejectedFiles = localData
  //     .filter((patch) => patch.status === 'Rejected')
  //     .map((patch) => patch.filename);
  //   console.log('Rejected files to send to backend:', rejectedFiles);
  //   // Add logic to send rejectedFiles to the backend
  //   // If no files are rejected, an empty array will be sent
  // };
  const handleApplyPatches = async () => {
    const rejectedFiles = localData
      .filter((patch) => patch.status === 'Rejected')
      .map((patch) => patch.filename);
  
    try {
      const response = await fetch('http://localhost:5000/api/apply-fixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectedFiles }),
      });
  
      if (response.ok) {
        // Trigger the download of the zip file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fixed-code.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Error applying fixes:', response.statusText);
      }
    } catch (error) {
      console.error('Error applying fixes:', error);
    }
  };

  // Handle accept all action
  const handleAcceptAll = () => {
    setLocalData((prev) =>
      prev.map((patch) => ({ ...patch, status: 'Accepted' })),
    );
  };

  // Handle reject all action
  const handleRejectAll = () => {
    setLocalData((prev) =>
      prev.map((patch) => ({ ...patch, status: 'Rejected' })),
    );
  };

  // Define tag colors
  const getTagColor = (tag: string) => {
    const tagColors: { [key: string]: { background: string; text: string } } = {
      animationFramePatch: { background: '#E6F7FF', text: '#0052CC' }, // Light blue background, dark blue text
      eventAssignmentPatch: { background: '#FFEBEE', text: '#C62828' }, // Light red background, dark red text
      collectionPatch: { background: '#FFF8E1', text: '#FF8F00' }, // Light amber background, dark amber text
      eventListenerPatch: { background: '#F3E5F5', text: '#8E24AA' }, // Light purple background, dark purple text
      timingEventPatch: { background: '#E0F7FA', text: '#0097A7' }, // Light cyan background, dark cyan text
      subscriptionPatch: { background: '#FBE9E7', text: '#D84315' }, // Light deep orange background, dark deep orange text
      memoryLeakFix: { background: '#E8F5E9', text: '#2E7D32' }, // Light green background, dark green text
      performancePatch: { background: '#FFF3E0', text: '#EF6C00' }, // Light orange background, dark orange text
    };
    return tagColors[tag] || { background: '#F5F5F5', text: '#212121' }; // Default light gray background, dark gray text
  };

  // Define columns
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'filename',
        header: 'File Name',
        size: 200,
      },
      {
        accessorKey: 'patchTag',
        header: 'Patch Tag',
        size: 150,
        Cell: ({ cell }) => {
          const tag = cell.getValue<string>();
          const { background, text } = getTagColor(tag);
          return (
            <Chip
              label={tag}
              sx={{
                backgroundColor: 'transparent',
                color: text,
                borderRadius: '12px',
                fontWeight: 'bold',
                border: `1.5px solid ${background}`,
              }}
            />
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          let color;
          switch (status) {
            case 'Accepted':
              color = '#68FF8E'; // Green
              break;
            case 'Rejected':
              color = '#FF6B6B'; // Red
              break;
            default:
              color = '#FFD700'; // Yellow for Pending
          }
          return (
            <Chip
              label={status}
              sx={{
                color: color,
                backgroundColor: 'transparent',
                border: `1.5px solid ${color}`,
                borderRadius: '12px',
                fontWeight: 'bold',
              }}
            />
          );
        },
      },
      {
        accessorKey: 'details',
        header: 'Details',
        size: 120,
        Cell: ({ row }) => (
          <Button
            variant="outlined"
            color="info"
            onClick={() => handleViewDetails(row.original.filename, row.original.rawDiff)}
          >
            View Details
          </Button>
        ),
        enableColumnActions: false,
        enableSorting: false,
      },
    ],
    [],
  );

  return (
    <Box>
      {/* Table */}
      <MaterialReactTable
        columns={columns}
        data={localData}
        layoutMode="grid"
        enableRowActions
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: '12px', width: '220px' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleApprove(row.original.filename)}
              disabled={row.original.status === 'Accepted'} // Disable if already accepted
              sx={{ flex: 1 }}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleReject(row.original.filename)}
              disabled={row.original.status === 'Rejected'} // Disable if already rejected
              sx={{ flex: 1 }}
            >
              Reject
            </Button>
          </Box>
        )}
      />

      {/* Accept All and Reject All Buttons (Centered) */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="contained" color="success" onClick={handleAcceptAll}>
          Accept All
        </Button>
        <Button variant="outlined" color="error" onClick={handleRejectAll}>
          Reject All
        </Button>
      </Box>

      {/* Apply Patches Button (Centered Below Accept All/Reject All) */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <CustomButton
          onClick={handleApplyPatches}
          size="small" // You can adjust the size (small, medium, large)
          bgColor={colors.primary} // Use your primary color
          fgColor={colors.background} // Use your background color
          title="Apply Patches"
          type="button"
          disabled={false} // Always enabled
        >
          Apply Patches and Download Fixed Code
        </CustomButton>
      </Box>

      {/* Modal for Diff Viewer */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: '0px',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Patch Details: {selectedDiff?.filename}
          </Typography>
          <DiffViewer
            diffs={[
              {
                filename: selectedDiff?.filename || '',
                fullCode: '',
                diffJson: [],
                rawDiff: selectedDiff?.rawDiff || '',
              },
            ]}
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setIsModalOpen(false)}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default PatchTable;