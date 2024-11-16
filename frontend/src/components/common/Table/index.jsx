import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material';

const DataTable = ({ columns, data, onRowClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Profit':
        return 'success.main';
      case 'Loss':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              onClick={() => onRowClick?.(row)}
              sx={{ 
                '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                cursor: onRowClick ? 'pointer' : 'default'
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    color: column.id === 'status' 
                      ? getStatusColor(row[column.id])
                      : 'text.primary'
                  }}
                >
                  {row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;