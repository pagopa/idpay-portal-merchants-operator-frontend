import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Button, ButtonProps, Divider, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { theme } from '@pagopa/mui-italia';
import { FieldConfigDef } from '../../utils/types';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { renderFields } from '../../utils/renderFields';
import { normalizeObj } from '../../utils/helpers';
import { useMemo } from 'react';

export type DynamicDrawerProps = {
  isOpen: boolean;
  setIsOpen: () => void;
  title: string;
  subtitle?: string;
  fieldsDef: Array<FieldConfigDef>;
  fieldsValues: Record<string, string>;
  buttons?: Array<(ButtonProps & { dataTestId?: string }) | never>;
};

const drawerStyle = {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  maxHeight: "100vh",
  rowGap: "1rem",
  maxWidth: 375,
  padding: "1.5rem",
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

  const mappedFields = useMemo( () => fieldsDef.map(({ cell, ...field }) => {
    const fieldsConfig = renderFields()
    return { ...field, headerName: t(field.headerName), renderCell: fieldsConfig[cell?.type] }
  }), [fieldsDef, t])

  const normalizedFields = useMemo(() => normalizeObj(fieldsValues), [fieldsValues]);

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
            sx={{ color: theme.palette.text.primary }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          sx={{ overflowY: 'auto' }}
        >
          <Box
            display="flex"
            flexDirection="column"
            width="100%"
            rowGap="1rem"
          >
            <Typography variant="h5" sx={{ wordWrap: "break-word" }}>{title}</Typography>
            {subtitle &&
              <>
                <Divider />
                <Typography
                  variant="body2"
                  fontWeight={theme.typography.fontWeightBold}
                  color={theme.palette.text.primary}
                >
                  {subtitle.toUpperCase()}
                </Typography>
              </>
            }
            {mappedFields.map(({ field, headerName, renderCell }) => {
              const params = {
                row: normalizedFields,
                value: normalizedFields?.[field]
              }
              return (<Box key={field}
                display="flex"
                flexDirection="column"
              >
                <Typography
                  fontWeight={theme.typography.fontWeightRegular}
                  color={theme.palette.text.secondary}
                >
                  {headerName}
                </Typography>
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
