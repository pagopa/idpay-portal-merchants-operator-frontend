import { Box, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import type {ReactNode} from 'react';
import {TitleBox} from "@pagopa/selfcare-common-frontend/lib";

interface Props {
    titleBox?: string;
    children?: ReactNode;
    subTitleBox?: string;
    inputTitle?: string;
}

export default function AcceptDiscountCard({ titleBox, children , subTitleBox ,inputTitle }: Props) {
    return (
        <Box py={3} px={4} sx={{ backgroundColor: theme.palette.background.paper }} borderRadius={'4px'}>
            <Box mb={2}>
                <TitleBox
                    title={titleBox}
                    mtTitle={2}
                    variantTitle="h6"
                    subTitle={subTitleBox}
                    variantSubTitle="body2"
                />
            </Box>
            <Box>
                <Typography variant="body1" fontWeight={theme.typography.fontWeightBold}>
                    {inputTitle}
                </Typography>
                {children}
            </Box>
        </Box>
    );
}
