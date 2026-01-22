import {useState, useEffect, useRef} from "react";
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
import {theme} from "@pagopa/mui-italia";
import {MISSING_DATA_PLACEHOLDER} from "../../utils/constants";
import {ReceiptLong} from "@mui/icons-material";

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
  invoiceStatus?: 'INVOICED' | 'REWARDED' | 'REFUNDED' | 'CANCELLED';
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
                                invoiceStatus
                              }: Props) => {
  const gridRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    if (isOpen && (invoiceStatus === "INVOICED" || invoiceStatus === "REWARDED")) {
      setTimeout(() => {
        checkHeight();
      }, 100);
    } else {
      setIsScrollable(false);
    }

  }, [isOpen, invoiceStatus])

  const itemsEntries = Object.entries(item).reduce(
    (acc, [key, value]) => [
      ...acc,
      [key, !value ? MISSING_DATA_PLACEHOLDER : value],
    ],
    []
  );

  const checkHeight = () => {
    if (gridRef.current) {
      const gridHeight = gridRef.current.scrollHeight;
      const maxHeight = window.innerHeight - 250;
      setIsScrollable(gridHeight > maxHeight);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      sx={{
        "& .MuiDrawer-paper": {
          width: 375,
          boxSizing: "border-box"
        },
      }}
    >
      <Box p={"1.5rem"} sx={{position: "relative"}}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            cursor: "pointer",
          }}
          mb={2}
        >
          <CloseIcon
            sx={{color: "#5C6F82"}}
            data-testid="close-details-drawer-button"
            onClick={() => setIsOpen(false)}
          />
        </Box>
        <Typography variant="h6" mb={2}>
          {title}
        </Typography>
        {subtitle && (
          <>
            <Divider color="#E3E7EB" sx={{mb: 2}}/>
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

        <Grid container spacing={2} ref={gridRef} sx={{
          overflowY: isScrollable ? 'auto' : 'visible',
          maxHeight: isScrollable ? 'calc(100vh - 250px)' : 'none',
          maxWidth: '100%'
        }} data-testId="item-test">
          {itemsEntries.map(([key, value], index) => {
            const isDownload = key === "Fattura" || key === "Nota di credito";

            return (
              key !== "id" &&
              key !== "cancelled" && (
                <Grid key={index} size={{xs: 12, md: 12, lg: 12}} sx={{wordWrap: 'break-word'}}>
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
                      sx={{
                        padding: "0",
                        alignItems: "flex-start"
                      }}
                      onClick={() => {
                        if (onFileDownloadCallback) onFileDownloadCallback();
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress
                          color="inherit"
                          size={20}
                          data-testid="item-loader"/>
                      ) : (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            textAlign: "left",
                            gap: 6,
                            width: "100%",
                            marginTop: 2
                          }}
                        >
                          <ReceiptLong style={{marginTop: 2}}/>
                          <Typography
                            component="span"
                            variant="inherit"
                            sx={{
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              lineHeight: 1.4,
                            }}
                          >
                              {value}
                          </Typography>
                        </span>
                      )}
                    </Button>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{fontWeight: theme.typography.fontWeightMedium, wordWrap: 'break-word'}}
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
            position: 'absolute',
            bottom: 0,
            width: '100%',
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem"
          }}
        >
          {primaryButton && (invoiceStatus === 'INVOICED' || invoiceStatus === 'REWARDED') && (
            <Button
              onClick={primaryButton?.onClick}
              href={primaryButton?.url}
              variant="contained"
              disabled={invoiceStatus === 'REWARDED'}
            >
              {primaryButton.label}
            </Button>
          )}
          {secondaryButton && (
            <Button
              onClick={secondaryButton?.onClick}
              sx={{marginTop: '10px'}}
              href={primaryButton?.url}
              disabled={invoiceStatus === 'REWARDED'}
            >
              {secondaryButton.label}
            </Button>
          )}
        </Box>
      )}
    </Drawer>
  );
};
