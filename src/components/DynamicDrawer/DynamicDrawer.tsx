import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Button, ButtonProps, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { theme } from '@pagopa/mui-italia';
import { FieldConfigDef } from '../../utils/types';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { fieldsConfig } from '../../utils/fieldsConfig';
import { normalizeObj } from '../../utils/helpers';

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
  const mappedFields = fieldsDef.map(({ cell, ...field }) =>
    ({ ...field, headerName: t(field.headerName), renderCell: fieldsConfig[cell?.type] }))
  const normalizedFields = normalizeObj(fieldsValues);
  return (
    <Drawer anchor="right" open={isOpen} data-testid="detail-drawer">
      <Box sx={drawerStyle}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" sx={{ wordWrap: "break-word" }}>{title}</Typography>
          <Box height="100%">
            <IconButton
              data-testid="close-button"
              onClick={setIsOpen}
              sx={{ color: theme.palette.text.primary }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
          {subtitle &&
            <Typography
              variant="body2"
              fontWeight={theme.typography.fontWeightBold}
              color={theme.palette.text.secondary}
            >
              {subtitle.toUpperCase()}
            </Typography>}
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
                  variant="body2"
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
