import { checkTooltipValue } from "../../utils/helpers";
import { NavigationLink } from "../NavigationLink/NavigationLink";
import { StatusChip } from "../StatusChip/StatusChip";

export const columnsConfig = {
    text: (params) => checkTooltipValue(params),
    link: (params) => <NavigationLink label={params?.value} path={params?.row?.route} />,
    chip: (params) => <StatusChip field={params?.row?.key} value={params?.value?.toLowerCase()} />
}