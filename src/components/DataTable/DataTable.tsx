import { DataGrid, GridSortModel, GridPaginationModel, GridRenderCellParams, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useEffect, useState, useCallback, useRef } from 'react';
import { IconButton, Box } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {MISSING_DATA_PLACEHOLDER} from '../../utils/constants';
import { PaginationExtendedModel } from '../../utils/types';

export interface DataTableProps {
  rows: GridRowsProp;
  columns: any[];
  handleRowAction?: (row: unknown) => void; 
  onSortModelChange?: (model: GridSortModel) => void;
  sortModel?: GridSortModel;
  onPaginationPageChange?: (obj: GridPaginationModel) => void;
  paginationModel?: PaginationExtendedModel;
  loading?: boolean;
}

const DataTable = ({ 
  rows, 
  columns, 
  handleRowAction, 
  onSortModelChange, 
  onPaginationPageChange, 
  paginationModel,
  loading = false,
  sortModel
}: DataTableProps) => {
  const [finalColumns, setFinalColumns] = useState<Array<GridColDef>>();
  const [sortModelState, setSortModelState] = useState<GridSortModel>([]);
  
  const isExternalUpdate = useRef(false);
  const [internalPaginationModel, setInternalPaginationModel] = useState(
    paginationModel || { page: 0, pageSize: 10, totalElements: 0 }
  );

  useEffect(() => {
    if (paginationModel) {
      isExternalUpdate.current = true;
      setInternalPaginationModel({
        page: paginationModel.page || 0,
        pageSize: paginationModel.pageSize || 10,
        totalElements: paginationModel.totalElements || 0
      });

      setTimeout(() => {
        isExternalUpdate.current = false;
      }, 100);
    }
  }, [paginationModel]);

  useEffect(() => {
    if (columns && columns.length > 0) {
      const processedColumns = columns.map((col: GridColDef) => ({
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
            renderCell: (params: GridRenderCellParams) => (
              <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%', height: '100%' }}>
                <IconButton
                  onClick={() => handleRowAction && handleRowAction(params.row)}
                >
                  <ChevronRightIcon color='primary' fontSize='inherit' />
                </IconButton>
              </Box>
            )
          }
        ]
      );
    }
  }, [columns, handleRowAction]);

  useEffect(() => {
    if(sortModel){
      setSortModelState(sortModel);
    }
  }, [sortModel]);

  const renderEmptyCell = (params: GridRenderCellParams) => {
    if (params.value === null || params.value === undefined || params.value === '') {
      return MISSING_DATA_PLACEHOLDER;
    }
    return params.value;
  };

  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    
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

    setInternalPaginationModel({...model, totalElements: 0});
    
    onPaginationPageChange?.({
      page: model.page,
      pageSize: model.pageSize
    });
  }, [onPaginationPageChange, loading, internalPaginationModel]);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    if(model.length > 0){
      setSortModelState(model);
      onSortModelChange?.(model);
    }else{
      setSortModelState((prevState: GridSortModel) => {
        const newSortModel: GridSortModel = prevState?.[0]?.sort === 'asc'
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
        rows?.length > 0 && finalColumns?.length > 0 && (
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
              '& .MuiDataGrid-row:not(:last-of-type)': {
                borderBottom: "1px solid #E3E7EB",
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