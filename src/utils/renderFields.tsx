import { DownloadFile } from "../components/DownloadFile/DownloadFile";
import { NavigationLink } from "../components/NavigationLink/NavigationLink";
import { StatusChip } from "../components/StatusChip/StatusChip";
import { formatDate, formatEuro, renderText } from "./helpers";
import { Box, IconButton } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link } from "../components/Link/Link";

const actionIcons = {
    info: <InfoOutlinedIcon color="primary" fontSize="inherit" />,
    arrow: <ChevronRightIcon color="primary" fontSize="inherit" />
}

type Props = {
    tooltip?: boolean,
    bold?: boolean
    options?: Record<string, string>
    context?: string
}

export const renderFields = ({ tooltip, bold, options, context }: Props) => ({
    text: (params) => <Box display="flex" alignItems="center" height="100%">
        {renderText(params.value, tooltip, bold)}
    </Box>,
    date: (params) => <Box display="flex" alignItems="center" height="100%">
        {renderText(formatDate(params.value, { options }), tooltip, bold)}
    </Box>,
    euro: (params) => <Box display="flex" alignItems="center" height="100%">
        {renderText(formatEuro(params.value), tooltip, bold)}
    </Box>,
    navigation: (params) =>
        <Box display="flex" alignItems="center" height="100%">
            <NavigationLink
                tooltip={tooltip}
                label={params?.value}
                path={params?.row?.route}
            />
        </Box>,
    link: (params) =>
        <Box display="flex" alignItems="center" height="100%">
            <Link tooltip={tooltip} label={params.value} href={params?.row?.link} />
        </Box>,
    chip: (params) =>
        <Box display="flex" alignItems="center" height="100%">
            <StatusChip tooltip={tooltip} context={context} value={params?.value?.toLowerCase()} />
        </Box>,
    download: (params) =>
        <Box display="flex" alignItems="center" height="100%">
            <DownloadFile
                tooltip={tooltip}
                onClick={params?.row?.onClick}
                isLoading={params?.row?.isLoading}
                text={params?.value}
                icon={params?.row?.icon}
            />
        </Box>,
    action: (params) =>
        <Box display="flex" alignItems="center" justifyContent="end" height="100%">
            <IconButton onClick={() => params?.value?.onClick(params.row)}>
                {actionIcons[params?.value?.icon]}
            </IconButton>
        </Box>
})