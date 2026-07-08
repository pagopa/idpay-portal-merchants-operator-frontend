import { Box, CircularProgress, Paper, Typography } from "@mui/material"
import { DataGrid, DataGridProps } from "@mui/x-data-grid"
import { theme } from "@pagopa/mui-italia"
import { useScopedTranslation } from "../../hooks/useScopedTranslation"
import { FieldConfigDef } from "../../utils/types"
import { renderFields } from "../../utils/renderFields"
import { useMemo } from "react"

type Props = Pick<DataGridProps, Exclude<keyof DataGridProps, "columns">> & {
    columnsDef: Array<FieldConfigDef>
    emptyText?: string
    isEmpty?: boolean
    isLoading?: boolean
    rowsDividerColor?: string
}

export const DynamicTable = ({ isEmpty, isLoading, columnsDef, emptyText, sx, rowsDividerColor, ...props }: Props) => {
    const { t } = useScopedTranslation()
    const mappedColumns = columnsDef.map(({ cell, ...column }) =>{
        const fieldConfig = renderFields(cell?.tooltip)
        return { ...column, headerName: t(column.headerName), renderCell: fieldConfig[cell?.type] }
})
    const tableStyle = useMemo(() => ({
        border: 'none',
        '& .MuiDataGrid-row': {
            backgroundColor: theme.palette.background.paper,
            borderBottom: rowsDividerColor ? `1px solid ${rowsDividerColor}` : 'none',
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
        }
    }), [rowsDividerColor])

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
                <Typography variant="body2">{emptyText}</Typography>
            </Paper> :
            <DataGrid
                {...props}
                columns={mappedColumns}
                disableRowSelectionOnClick
                sortingOrder={['asc', 'desc']}
                sx={{ ...tableStyle, ...sx }}
                localeText={{
                    footerTotalRows: 'Totale righe:',
                    paginationRowsPerPage: 'Elementi per pagina:',
                    paginationDisplayedRows: ({ from, to, count }) => {
                        return `${from}–${to} di ${count}`;
                    },
                }}
            />
    )
}