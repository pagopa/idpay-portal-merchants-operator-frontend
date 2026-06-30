import { checkTooltipValue } from "../../utils/helpers";
import { StatusChip } from "../../components/StatusChip/StatusChip";
import { NavigationLink } from "../../components/NavigationLink/NavigationLink";
import ROUTES from "../../routes";

export const columns = (t: (key: string) => string) => [
    {
        field: 'initiativeName',
        headerName: t('commons.pages.initiatives.tableHeaders.initiativeName'),
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        resizable: false,
        renderCell: (params) => <NavigationLink label={params.value} path={ROUTES.BUY_MANAGEMENT.replace(':initiativeId', params.id)} />,
    },
    {
        field: 'organizationName',
        headerName: t('commons.pages.initiatives.tableHeaders.organizationName'),
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        resizable: false,
        renderCell: (params) => checkTooltipValue(params),
    },
    {
        field: 'spendingPeriod',
        headerName: t('commons.pages.initiatives.tableHeaders.spendingPeriod'),
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        resizable: false,
        renderCell: (params) => checkTooltipValue(params),
    },
    {
        field: 'status',
        headerName: t('commons.pages.initiatives.tableHeaders.status'),
        flex: 1,
        sortable: true,
        disableColumnMenu: true,
        resizable: false,
        renderCell: (params) => <StatusChip value={params.value.toLowerCase()} />,
    }
]