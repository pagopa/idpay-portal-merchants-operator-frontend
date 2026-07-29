import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Button, ButtonProps, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { theme } from '@pagopa/mui-italia';
import { FieldConfigDef } from '../../utils/types';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { renderFields } from '../../utils/renderFields';
import { useMemo } from 'react';
import { FieldTitle } from './FieldTitle';

export type DynamicDrawerProps = {
  isOpen: boolean;
  setIsOpen: () => void;
  title: string;
  subtitle?: string;
  fieldsDef: Array<FieldConfigDef>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fieldsValues: Record<string, any>;
  buttons?: Array<(ButtonProps & { dataTestId?: string }) | never>;
};

const drawerStyle = {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  maxHeight: "100vh",
  maxWidth: 375,
  padding: "1rem",
  height: "100%"
}

export default function DynamicDrawer({
  isOpen,
  setIsOpen,
  title,
  subtitle,
  fieldsDef,
  fieldsValues,
  buttons,
}: DynamicDrawerProps) {
  const { t } = useScopedTranslation()

  const mappedFields = useMemo(() => fieldsDef.map(({ cell, ...field }) => {
    const { type, tooltip, bold, context, options } = cell
    const fieldsConfig = renderFields({ tooltip, bold, context, options })
    return { ...field, headerName: t(field.headerName), renderCell: fieldsConfig[type] }
  }), [fieldsDef, t])

  return (
    <Drawer anchor="right" open={isOpen} data-testid="detail-drawer">
      <Box sx={drawerStyle}>
        <Box
          display="flex"
          justifyContent="end"
          alignItems="center"
        >
          <IconButton
            data-testid="close-button"
            onClick={setIsOpen}
            sx={{ color: theme.palette.text.secondary }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          padding="0.5rem"
          sx={{ overflowY: 'auto' }}
        >
          <Box
            display="flex"
            flexDirection="column"
            width="100%"
            rowGap="1rem"
          >
            <Tooltip title={title || ''}>
              <Box sx={{
                display: "-webkit-box",
                "-webkit-line-clamp": "2",
                "-webkit-box-orient": "vertical",
                overflow: "hidden",
                whiteSpace: "normal",
                wordBreak: "break-word"
              }}>
                <Typography variant="h6">{title}</Typography>
              </Box>
            </Tooltip>
            {subtitle &&
              <>
                <Divider />
                <Typography
                  variant="caption"
                  fontWeight={theme.typography.fontWeightBold}
                  color={theme.palette.text.primary}
                >
                  {subtitle.toUpperCase()}
                </Typography>
              </>
            }
            {mappedFields.map(({ field, headerName, renderCell }, index) => {
              const params = {
                row: fieldsValues,
                value: fieldsValues?.[field]
              }
              return (<Box key={`${field}-${index}`}
                display="flex"
                flexDirection="column"
              >
                <FieldTitle title={headerName} />
                {renderCell(params)}
              </Box>)
            })}
          </Box>
        </Box>
        {buttons && !!buttons.length && (
          <Box
            position="sticky"
            bottom={0}
            width="100%"
            display="flex"
            flexDirection="column"
            rowGap="1rem"
            bgcolor={theme.palette.background.paper}
            data-testid="buttons-box"
          >
            {buttons.map(({ title, dataTestId, ...rest }, index) => (
              <Button {...rest} key={`${title}-${index}`} data-testid={dataTestId}>
                {title}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
