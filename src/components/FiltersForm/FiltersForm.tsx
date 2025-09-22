import {  Button, Grid } from '@mui/material';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import React, { cloneElement, isValidElement } from 'react';
import { FormikProps } from 'formik';

interface Props<T = any> {
  children?: React.ReactNode;
  formik: FormikProps<T>;
  onFiltersApplied?: (values: T) => void;
  onFiltersReset?: () => void;
}

const FiltersForm = <T extends Record<string, any>>({
  children,
  formik,
  onFiltersApplied,
  onFiltersReset
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
    <Grid sx={{ my: 4 }} container spacing={2} alignItems="center">
      {enhancedChildren}
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1 }}>
      <Button
        sx={{ height: '44.5px', gridColumn: 'span 1' }} 
        variant="outlined"
        fullWidth
        size="small"
        onClick={handleApplyFilters}
        disabled={formik.isSubmitting}
        data-testid="apply-filters-test"
      >
        {t('commons.filterBtn')}
      </Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
      <ButtonNaked
        component="button"
        sx={{
          color: 'primary.main',
          fontWeight: 600,
          fontSize: '0.875rem',
          gridColumn: 'span 1'
        }}
        onClick={handleResetFilters}
        disabled={formik.isSubmitting}
        data-testid="reset-filters-test"
      >
        {t('commons.removeFiltersBtn')}
      </ButtonNaked>
      </Grid>
    </Grid>
  );
};

export default FiltersForm;