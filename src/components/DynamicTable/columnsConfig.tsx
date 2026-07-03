import { checkTooltipValue, renderMissingDataWithTooltip } from "../../utils/helpers";
import { NavigationLink } from "../NavigationLink/NavigationLink";
import { StatusChip } from "../StatusChip/StatusChip";

export const columnsConfig = {
    text: (params) => checkTooltipValue(params),
    link: (params) => params.value ? <NavigationLink label={params?.value} path={params?.row?.route} /> : renderMissingDataWithTooltip(),
    chip: (params) => params.value ? <StatusChip field={params?.row?.key} value={params?.value?.toLowerCase()} /> : renderMissingDataWithTooltip()
}