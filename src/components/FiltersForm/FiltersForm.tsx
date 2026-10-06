import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import React, { cloneElement, isValidElement } from 'react';
import { FormikProps } from 'formik';

interface Props<T = any> {
  children?: React.ReactNode;
  formik: FormikProps<T>;
  onFiltersApplied?: (values: T) => void;
  onFiltersReset?: () => void;
  filtersApplied?: boolean;
  filtersAppliedOnce?: boolean;
}

const FiltersForm = <T extends Record<string, any>>({
  children,
  formik,
  onFiltersApplied,
  onFiltersReset,
  filtersApplied,
  filtersAppliedOnce,
}: Props<T>) => {
  const { t } = useTranslation();

  const handleApplyFilters = () => {
    if (onFiltersApplied) {
      onFiltersApplied(formik.values);
    }
  };

  const handleResetFilters = () => {
    formik.resetForm();
    if (onFiltersReset) {
      onFiltersReset();
    }
  };

  const enhancedChildren = React.Children.map(children, (child) => {
    if (isValidElement(child) && child.props.name) {
      const fieldName = child.props.name;

      return cloneElement(child, {
        ...child.props,
        value: formik.values[fieldName] || '',
        onChange: (event: any) => {
          formik.handleChange(event);
          if (child.props.onChange) {
            child.props.onChange(event);
          }
        },
        onBlur: (event: any) => {
          formik.handleBlur(event);
          if (child.props.onBlur) {
            child.props.onBlur(event);
          }
        },
      });
    }
    return child;
  });

  return (
    <Box display="flex" flexDirection="row" columnGap="1rem" alignItems="flex-start" width="100%">
        {enhancedChildren}
      <Box display="flex" flexDirection="row" alignItems="center" columnGap="1rem" minWidth="fit-content">
        <Button
          sx={{ minWidth: 'fit-content' }}
          variant="outlined"
          onClick={handleApplyFilters}
          disabled={formik.isSubmitting || !filtersApplied}
          data-testid="apply-filters-test"
        >
          {t('commons.filterBtn')}
        </Button>
        <Button
          sx={{ minWidth: 'fit-content' }}
          variant="naked"
          onClick={handleResetFilters}
          disabled={formik.isSubmitting || (!filtersApplied && !filtersAppliedOnce)}
          data-testid="reset-filters-test"
        >
          {t('commons.removeFiltersBtn')}
        </Button>
      </Box>
    </Box>
  );
};

export default FiltersForm;
