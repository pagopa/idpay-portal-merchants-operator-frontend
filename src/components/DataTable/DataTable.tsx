import React from 'react';
import { DataGrid, type GridSortModel } from '@mui/x-data-grid';
import { useEffect, useState, useCallback } from 'react';
import { IconButton, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {MISSING_DATA_PLACEHOLDER} from '../../utils/constants';

export interface DataTableProps {
  rows: any;
  columns: any;
  pageSize: number;
  rowsPerPage: number;
  handleRowAction?: (row: any) => void; 
  onSortModelChange?: (model: any) => void;
  sortModel?: GridSortModel;
  onPaginationPageChange?: (page: number) => void;
  paginationModel?: any;
}


const DataTable = ({ rows, columns, rowsPerPage, handleRowAction, onSortModelChange, onPaginationPageChange, paginationModel }: DataTableProps) => {
  const [finalColumns, setFinalColumns] = useState(Array<any>);
  const [sortModelState, setSortModelState] = useState<any>([]);


  useEffect(() => {
    if (columns && columns.length > 0) {
      const processedColumns = columns.map((col: any) => ({
        ...col,
        renderCell: col.renderCell ? col.renderCell : renderEmptyCell
      }));

      setFinalColumns(
        [
          ...processedColumns,
          {
            field: 'actions',
            headerName: '',
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            flex: 1,
            renderCell: (params: any) => (
              <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
                <IconButton
                  onClick={() => handleRowAction(params.row)}
                  size="small"
                >
                  <ArrowForwardIosIcon color='primary' fontSize='small' />
                </IconButton>
              </Box>
            )
          }
        ]
      );
    }
  }, [columns]);


  const renderEmptyCell = (params: any) => {
    if (params.value === null || params.value === undefined || params.value === '') {
      return MISSING_DATA_PLACEHOLDER;
    }
    return params.value;
  };

//   const handlePageChange = (page: number) => {
//     onPaginationPageChange?.(page);
//   };

  const handlePaginationModelChange = (model: any) => {
    console.log("MODEL", model);
    onPaginationPageChange?.(model);
  };    

  const handleSortModelChange = useCallback((model: any) => {
    console.log("MODEL", model);
    if(model.length > 0){
      setSortModelState(model);
      onSortModelChange?.(model);
    }else{
      setSortModelState((prevState: any) => {
        const newSortModel = prevState?.[0].sort === 'asc'
          ? [{field: prevState?.[0].field, sort: 'desc'}]
          : [{field: prevState?.[0].field, sort: 'asc'}];
        
        onSortModelChange?.(newSortModel);
        console.log("NEW MODEL", newSortModel);
        
        return newSortModel;
      });
    }
    
  }, [onSortModelChange]);

  return (
    <>
      {
        rows?.length > 0 && columns?.length > 0 && (
          <DataGrid
            rows={rows}
            columns={finalColumns}
            disableRowSelectionOnClick
            sortingMode='server'
            paginationMode='server'
            onSortModelChange={handleSortModelChange}
            sortModel={sortModelState}
            paginationModel={paginationModel}
            onPaginationMetaChange={handlePaginationModelChange}
            rowCount={paginationModel?.totalElements}
            localeText={{
                noRowsLabel: 'Nessun punto vendita da visualizzare.',
                footerTotalRows: 'Totale righe:',
                paginationRowsPerPage: 'Righe per pagina:',
                paginationDisplayedRows: ({ from, to}) => {
                  return `${from}–${to} di ${rows.length }`;
                },
              }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-row': {
                backgroundColor: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#FFFFFF',
                },
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none'
              },
              // '& .MuiDataGrid-footerContainer': {
              //   border: 'none'
              // }, 
               '& .MuiDataGrid-cell:focus': {
                outline: 'none'
              }, 
               '& .MuiDataGrid-columnHeader:focus': {
                outline: 'none'
              },
               '& .MuiDataGrid-cell:focus-within': {
                outline: 'none'
              },
              '& .MuiDataGrid-iconButtonContainer button': {
                backgroundColor: 'transparent'
              },
              '& .MuiTablePagination-root': {
                overflowY: 'hidden',

                '& button': {
                  backgroundColor: 'transparent !important'
                }
              }
            }}
          />
        )
      }
    </>

  );
};

export default DataTable;