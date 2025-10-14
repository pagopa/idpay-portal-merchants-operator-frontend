import {
  Divider,
  Grid,
  Typography,
  Box,
  Drawer,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { theme } from "@pagopa/mui-italia";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

type ButtonProps = {
  label: string;
  url?: string;
  onClick?: () => void;
};

type Props = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isLoading?: boolean;
  title: string;
  subtitle?: string;
  item: unknown;
  primaryButton?: ButtonProps;
  secondaryButton?: ButtonProps;
  onFileDownloadCallback?: () => void;
};

export const DetailsDrawer = ({
  isOpen,
  setIsOpen,
  isLoading,
  title,
  subtitle,
  item,
  primaryButton,
  secondaryButton,
  onFileDownloadCallback,
}: Props) => {
  const itemsEntries = Object.entries(item).reduce(
    (acc, [key, value]) => [
      ...acc,
      [key, !value ? MISSING_DATA_PLACEHOLDER : value],
    ],
    []
  );

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      sx={{
        "& .MuiDrawer-paper": {
          width: 375,
          boxSizing: "border-box",
        },
      }}
    >
      <Box p={"1.5rem"} sx={{ position: "relative", height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            cursor: "pointer",
          }}
          mb={2}
        >
          <CloseIcon
            sx={{ color: "#5C6F82" }}
            data-testid="close-details-drawer-button"
            onClick={() => setIsOpen(false)}
          />
        </Box>
        <Typography variant="h6" mb={2}>
          {title}
        </Typography>
        {subtitle && (
          <>
            <Divider color="#E3E7EB" sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Typography
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  fontSize: "14px",
                }}
              >
                {subtitle}
              </Typography>
            </Grid>
          </>
        )}

        <Grid container spacing={2} data-testId="item-test">
          {itemsEntries.map(([key, value], index) => {
            const isDownload = key === "Fattura" || key === "Nota di credito";

            return (
              key !== "id" &&
              key !== "cancelled" && (
                <Grid key={index} size={{ xs: 12, md: 12, lg: 12 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: theme.typography.fontWeightRegular,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {key}
                  </Typography>
                  {isDownload && value !== MISSING_DATA_PLACEHOLDER ? (
                    <Button
                      data-testid="btn-test"
                      sx={{ padding: "0" }}
                      onClick={() => {
                        if (onFileDownloadCallback) onFileDownloadCallback();
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress
                          color="inherit"
                          size={20}
                          data-testid="item-loader"
                        />
                      ) : (
                        <>
                          <DescriptionOutlinedIcon /> {value}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: theme.typography.fontWeightMedium }}
                    >
                      {value}
                    </Typography>
                  )}
                </Grid>
              )
            );
          })}
        </Grid>
      </Box>

      {(primaryButton || secondaryButton) && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem",
            boxShadow: "0 9px 46px 8px #002B551A",
          }}
        >
          {primaryButton && (
            <Button
              onClick={primaryButton?.onClick}
              href={primaryButton?.url}
              variant="contained"
            >
              {primaryButton.label}
            </Button>
          )}
          {secondaryButton && (
            <Button
              onClick={secondaryButton?.onClick}
              href={primaryButton?.url}
            >
              {secondaryButton.label}
            </Button>
          )}
        </Box>
      )}
    </Drawer>
  );
};
