import { Box, CircularProgress, Paper, Typography } from "@mui/material"
import { DataGrid, DataGridProps } from "@mui/x-data-grid"
import { theme } from "@pagopa/mui-italia"
import { useScopedTranslation } from "../../hooks/useScopedTranslation"
import { FieldConfigDef } from "../../utils/types"
import { fieldsConfig } from "../../utils/fieldsConfig"

type Props = Pick<DataGridProps, Exclude<keyof DataGridProps, "columns">> & {
    columnsDef: Array<FieldConfigDef>
    emptyText?: string
    isEmpty?: boolean
    isLoading?: boolean
}

export const DynamicTable = ({ isEmpty, isLoading, columnsDef, emptyText, ...props }: Props) => {
    const { t } = useScopedTranslation()
    const mappedColumns = columnsDef.map(({ cell, ...column }) =>
        ({ ...column, headerName: t(column.headerName), renderCell: fieldsConfig[cell?.type] }))

    return (isLoading ?
        <Box
            mt={3}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <CircularProgress />
        </Box> :
        isEmpty ?
            <Paper
                sx={{
                    my: 4,
                    p: 3,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="body2">{t(emptyText)}</Typography>
            </Paper> :
            <DataGrid
                {...props}
                columns={mappedColumns}
                disableRowSelectionOnClick
                sortingOrder={['asc', 'desc']}
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-row': {
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': {
                            backgroundColor: theme.palette.background.paper,
                        },
                    },
                    '& .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    },
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-cell:focus-within': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-columnHeader:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-columnHeader:focus-within': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-iconButtonContainer button': {
                        backgroundColor: 'transparent',
                    },
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: theme.palette.grey[100],
                    },
                    '& .MuiDataGrid-footerContainer': {
                        backgroundColor: theme.palette.grey[100],
                    },
                    '& .MuiTablePagination-root': {
                        overflowY: 'hidden',
                        '& button': {
                            backgroundColor: 'transparent !important',
                        },
                    },
                }}
            />)
}