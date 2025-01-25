import { useMemo, useState } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { Box, Button } from '@mui/material';

// Define the patch data type
interface Patch {
  fileName: string;
  patchSummary: string;
}

const initialData: Patch[] = [
  {
    fileName: 'utils.js',
    patchSummary: 'Fixed memory leak in event listeners.',
  },
  {
    fileName: 'index.html',
    patchSummary: 'Removed 5 persistent DOM nodes.',
  },
  {
    fileName: 'app.js',
    patchSummary: 'Resolved Detached <div>: Saved 1792 bytes of memory.',
  },
];

export const PatchTable = () => {
  const [data, setData] = useState<Patch[]>(initialData);
  const [rejectedPatches, setRejectedPatches] = useState<string[]>([]); // Track rejected patches

  const handleApprove = (fileName: string) => {
    console.log(`Approved patch: ${fileName}`);
  };

  const handleReject = (fileName: string) => {
    setRejectedPatches((prev) => [...prev, fileName]);
    console.log(`Rejected patch: ${fileName}`);
  };

  const columns = useMemo<MRT_ColumnDef<Patch>[]>(
    () => [
      {
        accessorKey: 'fileName',
        header: 'File Name',
      },
      {
        accessorKey: 'patchSummary',
        header: 'Patch Summary',
        size: 300, // Make this column wider for better readability
      },
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      layoutMode="grid"
      displayColumnDefOptions={{
        'mrt-row-actions': {
          size: 180,
          grow: false,
        },
      }}
      enableRowActions
      renderRowActions={({ row }) => (
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleApprove(row.original.fileName)}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleReject(row.original.fileName)}
          >
            Reject
          </Button>
        </Box>
      )}
    />
  );
};

export default PatchTable;
