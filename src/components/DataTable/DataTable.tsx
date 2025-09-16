import { DataGrid, type GridSortModel } from '@mui/x-data-grid';
import { useEffect, useState, useCallback, useRef } from 'react';
import { IconButton, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {MISSING_DATA_PLACEHOLDER} from '../../utils/constants';

export interface DataTableProps {
  rows: any;
  columns: any;
  handleRowAction?: (row: any) => void; 
  onSortModelChange?: (model: any) => void;
  sortModel?: GridSortModel;
  onPaginationPageChange?: (obj: any) => void;
  paginationModel?: any;
  loading?: boolean;
}

const DataTable = ({ 
  rows, 
  columns, 
  handleRowAction, 
  onSortModelChange, 
  onPaginationPageChange, 
  paginationModel,
  loading = false 
}: DataTableProps) => {
  const [finalColumns, setFinalColumns] = useState(Array<any>);
  const [sortModelState, setSortModelState] = useState<any>([]);
  
  const isExternalUpdate = useRef(false);
  const [internalPaginationModel, setInternalPaginationModel] = useState(
    paginationModel || { pageNo: 0, pageSize: 10, totalElements: 0 }
  );

  useEffect(() => {
    if (paginationModel) {
      isExternalUpdate.current = true;
      setInternalPaginationModel({
        page: paginationModel.pageNo || 0,
        pageSize: paginationModel.pageSize || 10
      });

      setTimeout(() => {
        isExternalUpdate.current = false;
      }, 100);
    }
  }, [paginationModel]);

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
                  onClick={() => handleRowAction && handleRowAction(params.row)}
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
  }, [columns, handleRowAction]);

  const renderEmptyCell = (params: any) => {
    if (params.value === null || params.value === undefined || params.value === '') {
      return MISSING_DATA_PLACEHOLDER;
    }
    return params.value;
  };

  const handlePaginationModelChange = useCallback((model: any) => {
    
    if (isExternalUpdate.current) {
      return;
    }

    if (loading) {
      return;
    }

    const currentPage = internalPaginationModel.page || 0;
    const currentPageSize = internalPaginationModel.pageSize || 10;
    
    if (model.page === currentPage && model.pageSize === currentPageSize) {
      return;
    }

    setInternalPaginationModel(model);
    
    onPaginationPageChange?.({
      pageNo: model.page,
      pageSize: model.pageSize
    });
  }, [onPaginationPageChange, loading, internalPaginationModel]);

  const handleSortModelChange = useCallback((model: any) => {
    if(model.length > 0){
      setSortModelState(model);
      onSortModelChange?.(model);
    }else{
      setSortModelState((prevState: any) => {
        const newSortModel = prevState?.[0]?.sort === 'asc'
          ? [{field: prevState?.[0].field, sort: 'desc'}]
          : [{field: prevState?.[0].field, sort: 'asc'}];
        
        onSortModelChange?.(newSortModel);
        
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
            loading={loading}
            onSortModelChange={handleSortModelChange}
            sortModel={sortModelState}
            paginationModel={{
              page: internalPaginationModel.page || 0,
              pageSize: internalPaginationModel.pageSize || 10
            }}
            onPaginationModelChange={handlePaginationModelChange}
            rowCount={paginationModel?.totalElements || 0}
            localeText={{
                noRowsLabel: 'Nessun punto vendita da visualizzare.',
                footerTotalRows: 'Totale righe:',
                paginationRowsPerPage: 'Righe per pagina:',
                paginationDisplayedRows: ({ from, to, count}) => {
                  return `${from}–${to} di ${count}`;
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
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: '#F5F5F5', 
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: '#F5F5F5' 
              }, 
            }}
          />
        )
      }
    </>
  );
};

export default DataTable;