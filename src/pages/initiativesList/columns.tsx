import { checkTooltipValue } from "../../utils/helpers";
import { StatusChip } from "../../components/StatusChip/StatusChip";
import { NavigationLink } from "../../components/NavigationLink/NavigationLink";
import ROUTES from "../../routes";

export const columns = [
    {
        field: 'initiativeName',
        headerName: 'Nome',
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        resizable: false,
        renderCell: (params) => <NavigationLink label={params.value} path={ROUTES.BUY_MANAGEMENT.replace(':initiativeId', params.id)} />,
    },
    {
        field: 'organizationName',
        headerName: 'Creata da',
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        resizable: false,
        renderCell: (params) => checkTooltipValue(params),
    },
    {
        field: 'spendingPeriod',
        headerName: 'Periodo di spesa',
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        resizable: false,
        renderCell: (params) => checkTooltipValue(params),
    },
    {
        field: 'status',
        headerName: 'Stato',
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        resizable: false,
        renderCell: (params) => <StatusChip value={params.value.toLowerCase()} />,
    }
]