import React from 'react';
import { Typography, Box, Paper, Tooltip, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const rows = [
  { id: 1, timestamp: '2026-04-07T09:15:00Z', numBackups: 12, problems: ['01', '05'] },
  { id: 2, timestamp: '2026-04-07T10:30:00Z', numBackups: 45, problems: ['03'] },
  { id: 3, timestamp: '2026-04-07T11:45:00Z', numBackups: 8, problems: ['07', '08', '09'] },
  { id: 4, timestamp: '2026-04-07T13:20:00Z', numBackups: 102, problems: ['12'] },
  { id: 5, timestamp: '2026-04-07T15:05:00Z', numBackups: 23, problems: ['02', '04'] },
];

const formatTimestamp = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const AutograderSpam = () => {
  const columns = [
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      flex: 1,
      valueGetter: (value) => value,
      valueFormatter: (value) => formatTimestamp(value),
    },
    {
      field: 'numBackups',
      headerName: 'Number of Backups',
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'problems',
      headerName: 'Problem(s) Worked On',
      flex: 1,
      valueGetter: (value) => (value ? value.join(', ') : ''),
    },
    {
      field: 'actions',
      headerName: 'Details',
      width: 100,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title="Jump to Timeline">
          <IconButton
            color="primary"
            size="small"
            onClick={() => console.log(`Opening ID: ${params.id}`)}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Autograder Spam
      </Typography>

      <Paper sx={{ height: 400, width: '100%', mt: 3, boxShadow: 3, borderRadius: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};

export default AutograderSpam;