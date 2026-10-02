import { Box, CircularProgress, Paper, Typography } from "@mui/material"
import { DataGrid, DataGridProps } from "@mui/x-data-grid"
import { theme } from "@pagopa/mui-italia"
import { useScopedTranslation } from "../../hooks/useScopedTranslation"
import { FieldConfigDef } from "../../utils/types"
import { renderFields } from "../../utils/renderFields"
import { useMemo, useRef, useState } from "react"

export type DynamicTableProps = Pick<DataGridProps, Exclude<keyof DataGridProps, "columns">> & {
    columnsDef: Array<FieldConfigDef>
    emptyText?: string
    isEmpty?: boolean
    isLoading?: boolean
    rowsDividerColor?: string
}

export const DynamicTable = ({
    isEmpty,
    isLoading,
    columnsDef,
    emptyText,
    sx,
    rowsDividerColor,
    onSortModelChange,
    onPaginationModelChange,
    ...props }: DynamicTableProps) => {
    const { t } = useScopedTranslation()
    const ref = useRef(false)
    const [sortModel, setSortModel] = useState({ field: '', sort: '' })

    const mappedColumns = useMemo(() => columnsDef.map(({ cell, ...column }) => {
        const { type, tooltip, context, options } = cell
        const fieldConfig = renderFields({ tooltip, context, options })
        return { ...column, headerName: t(column.headerName), renderCell: fieldConfig[type] }
    }), [columnsDef, t])

    const setupGrid = (node) => {
        if (!node) return
        const pageBtns = node.querySelectorAll('.MuiTablePaginationActions-root button')
        const select = node.querySelector('[role="combobox"]')
        if (pageBtns.length) {
            const [prev, next] = pageBtns
            next.classList.add('name:next-page')
            prev.classList.add('name:previous-page')
        }
        if (select) select.addEventListener('mousedown', () => {
            setTimeout(() => {
                const menuItems = document.querySelectorAll('[role="option"]');
                menuItems.forEach((item, index) => item.classList.add(`name:select-page-size-option-${index}`));
            }, 0)
        }, true)
    }

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
        '& .MuiDataGrid-columnHeader * svg': {
            pointerEvents: 'none'
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

    return (<Box> {isLoading ?
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
                ref={setupGrid}
                slotProps={{ baseIconButton: { title: "" } }}
                onSortModelChange={(model, details) => {
                    ref.current = true
                    const [firstModel] = model
                    onSortModelChange(model, details)
                    setSortModel(firstModel)
                    setTimeout(() => ref.current = false, 0)
                }}
                onPaginationModelChange={(model, details) => {
                    if (ref.current) return
                    onPaginationModelChange(model, details)
                }}
                columns={mappedColumns}
                disableRowSelectionOnClick
                sortingOrder={['asc', 'desc']}
                sx={{ ...tableStyle, ...sx }}
                classes={{ sortButton: `name:sort-${sortModel?.field}-${sortModel?.sort}` }}
                localeText={{
                    paginationItemAriaLabel: () => "",
                    footerTotalRows: 'Totale righe:',
                    paginationRowsPerPage: 'Elementi per pagina:',
                    paginationDisplayedRows: ({ from, to, count }) => {
                        return `${from}-${to} di ${count}`;
                    },
                }}
            />}
    </Box>)
}