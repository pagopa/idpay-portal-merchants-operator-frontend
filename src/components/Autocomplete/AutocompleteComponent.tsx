import { useState, useEffect, useCallback, useRef } from "react";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { ProductDTO } from "../../api/generated/merchants/ProductDTO";
import { REQUIRED_FIELD_ERROR } from "../../utils/constants";
import { useTranslation } from "react-i18next";

type AutocompleteComponentProps = {
  options: ProductDTO[];
  onChangeDebounce?: (value: string) => void;
  inputError?: boolean;
  onChange?: (value: ProductDTO | null) => void;
  value?: ProductDTO | null;
  width?: string | number;
};

const autocompleteSx = (width?: string | number) => ({
  width,
  "& .MuiFormLabel-root.Mui-error": {
    color: "#5C6E82 !important",
  },
});

const popperSx = {
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15), 0px 0px 2px rgba(0, 0, 0, 0.05)",
  borderRadius: "4px",
  "& .MuiAutocomplete-option": {
    "&:hover": {
      backgroundColor: "#0073E614 !important",
      color: "#0073E6 !important",
      fontWeight: "600 !important",
    },
  },
  "& .MuiAutocomplete-noOptions": {
    fontWeight: "600",
  },
};

const listboxSx = {
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#0073E6",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#005BB5",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f1f1f1",
    borderRadius: "4px",
  },
};

function getVisibleOptions(
  loading: boolean,
  inputValue: string,
  options: ProductDTO[]
) {
  return loading ? [] : inputValue.trim().length >= 5 ? options : [];
}

export default function AutocompleteComponent({
  options,
  onChangeDebounce,
  inputError,
  onChange,
  value,
  width,
}: AutocompleteComponentProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value?.fullProductName || "");
  const { t } = useTranslation();

  const isOptionEqualToValue = useCallback(
    (option: ProductDTO, value: ProductDTO) =>
      option?.fullProductName === value?.fullProductName,
    []
  );

  const getOptionLabel = useCallback(
    (option: ProductDTO) => option?.fullProductName || "",
    []
  );

  useEffect(() => {
    if (
      value?.fullProductName &&
      value.fullProductName !== inputValue &&
      inputValue === ""
    ) {
      setInputValue(value.fullProductName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const lastDebouncedValue = useRef<string>("");

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 5) {
      setLoading(false);
      lastDebouncedValue.current = "";
      return;
    }
    if (lastDebouncedValue.current === trimmed) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const timer = setTimeout(() => {
      if (onChangeDebounce) {
        onChangeDebounce(trimmed);
        lastDebouncedValue.current = trimmed;
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [inputValue, onChangeDebounce]);

  useEffect(() => {
    setLoading(false);
  }, [options]);

  const handleChange = useCallback(
    (_: unknown, newValue: ProductDTO | null) => {
      if (onChange) {
        onChange(newValue ?? null);
      }
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (_: unknown, newInputValue: string) => {
      setInputValue(newInputValue);
      if (value && value.fullProductName !== newInputValue.trim() && onChange) {
        onChange(null);
      }
    },
    [onChange, value]
  );

  const handleBlur = useCallback(() => {
    const normalized = inputValue.trim().replace(/\s+/g, " ");
    if (inputValue !== normalized) {
      setInputValue(normalized);
    }
  }, [inputValue]);

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = event.clipboardData.getData("text");
      const normalized = pasted.trim().replace(/\s+/g, " ");
      event.preventDefault();
      setInputValue(normalized);
    },
    []
  );

  return (
    <Autocomplete
      id="server-side-autocomplete"
      sx={autocompleteSx(width)}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionLabel={getOptionLabel}
      options={getVisibleOptions(loading, inputValue, options)}
      loading={loading}
      noOptionsText={t("pages.acceptDiscount.noOptionsText")}
      loadingText={t("pages.acceptDiscount.loadingText")}
      value={value ?? null}
      inputValue={inputValue}
      onChange={handleChange}
      onInputChange={handleInputChange}
      filterOptions={(x) => x}
      clearOnBlur={false}
      selectOnFocus
      handleHomeEndKeys
      renderInput={(params) => (
        <TextField
          {...params}
          label="Cerca"
          size="small"
          error={inputError}
          helperText={inputError ? REQUIRED_FIELD_ERROR : ""}
          sx={{ marginTop: 2 }}
          onBlur={handleBlur}
          onPaste={handlePaste}
          InputProps={{
            ...params.InputProps,
            sx: {
              paddingRight: "0px !important",
            },
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
              </>
            ),
          }}
        />
      )}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 8],
              },
            },
          ],
          sx: popperSx,
        },
        listbox: {
          sx: listboxSx,
        },
      }}
    />
  );
}
