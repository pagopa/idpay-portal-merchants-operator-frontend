import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { ProductDTO } from '../../api/generated/merchants/ProductDTO';
import { REQUIRED_FIELD_ERROR } from '../../utils/constants';
import { useTranslation } from "react-i18next";


export default function AutocompleteComponent({ options, onChangeDebounce, inputError, onChange, value }: { options: ProductDTO[], onChangeDebounce?: (value: string) => void, inputError?: boolean, onChange?: (value: ProductDTO) => void, value?: ProductDTO }) {
  // const [currentValue, setCurrentValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [optionValue, setOptionValue] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    // If input is less than 5 characters, clear options and do nothing.
    if (inputValue.length < 5 || inputValue.trim().length === 0 || optionValue === inputValue) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      if (onChangeDebounce) {
        onChangeDebounce(inputValue);
      }
    }, 800); // 800ms debounce

    ///clean timer when inputValue change
    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]);

  useEffect(() => {
    setLoading(false);
  }, [options]);


  useEffect(() => {
    console.log("CURRENT", value);
  }, [value]);

  return (
    <Autocomplete
      id="server-side-autocomplete"
      sx={{
        width: '50%',
        '& .MuiFormLabel-root.Mui-error': {
          color: '#5C6E82 !important',
        }
      }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      // Determine if two options are equal
      isOptionEqualToValue={(option, value) => option?.productName === value?.productName}
      // Extract the label from the option
      getOptionLabel={(option) => {setOptionValue(option?.productName); return option?.productName}}
      options={options}
      loading={loading}
      noOptionsText={t('pages.acceptDiscount.noOptionsText')}
      loadingText={t('pages.acceptDiscount.loadingText')}
      value={value}
      onChange={(_, value) => {
        if (onChange) {
          onChange(value);
        }
      }}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue); 
      }}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Cerca"
          size='small'
          error={inputError}
          helperText={inputError ? REQUIRED_FIELD_ERROR : ""}
          sx={{ marginTop: 2 }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
              </>
            ),
          }}
        />
      )}
      slotProps={{
        popper: {
          sx: {
            '& .MuiAutocomplete-option': {
              '&:hover': {
                backgroundColor: '#0073E614 !important',
                color: '#0073E6 !important',
                fontWeight: '600 !important',
              },
            },
            '& .MuiAutocomplete-noOptions': {
              fontWeight: '600',
            },
          },
        },
        listbox: {
          sx: {
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#0073E6',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#005BB5',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: '4px',
            },
          },
        }
      }}
    />
  );
}