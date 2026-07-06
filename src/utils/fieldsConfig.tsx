import { theme } from "@pagopa/mui-italia";
import { DownloadFile } from "../components/DownloadFile/DownloadFile";
import { NavigationLink } from "../components/NavigationLink/NavigationLink";
import { StatusChip } from "../components/StatusChip/StatusChip";
import { checkTooltipValue, renderMissingDataWithTooltip } from "./helpers";
import { IconButton, Typography } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const actionIcons = {
    info: <InfoOutlinedIcon color="primary" fontSize="inherit" />,
    arrow: <ChevronRightIcon color="primary" fontSize="inherit" />
}

export const fieldsConfig = {
    tooltip: (params) => checkTooltipValue(params),
    link: (params) => params.value ? <NavigationLink label={params?.value} path={params?.row?.route} /> : renderMissingDataWithTooltip(),
    chip: (params) => params.value ? <StatusChip field={params?.row?.key} value={params?.value?.toLowerCase()} /> : renderMissingDataWithTooltip(),
    download: (params) => params.value ?
        <DownloadFile
            onClick={params?.onClick}
            isLoading={params?.isLoading}
            text={params?.value}
            icon={params?.icon}
        /> :
        renderMissingDataWithTooltip(),
    text: (params) => params?.value ?
        <Typography
            component="div"
            variant="body2"
            sx={{
                fontWeight: theme.typography.fontWeightMedium,
                wordWrap: "break-word",
            }}
        >
            {params.value}
        </Typography> :
        renderMissingDataWithTooltip(),
    action: (params) => {
        <IconButton onClick={() => params?.value?.onClick(params.row)}>
            {actionIcons[params?.value?.icon]}
        </IconButton>}
}