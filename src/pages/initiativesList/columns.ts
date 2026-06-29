import { GridRenderCellParams } from "@mui/x-data-grid";
import { checkTooltipValue, renderStatusChip } from "../../utils/helpers";

export const columns = [
    {
        field: 'initiativeName',
        headerName: 'Nome',
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams) => checkTooltipValue(params),
    },
    {
        field: 'organizationName',
        headerName: 'Creata da',
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams) => checkTooltipValue(params),
    },
    {
        field: 'spendingPeriod',
        headerName: 'Periodo di spesa',
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams) => checkTooltipValue(params),
    },
    {
        field: 'status',
        headerName: 'Stato',
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams) => renderStatusChip(params.value.toLowerCase()),
    }
]