import { useCallback, useEffect, useState } from 'react';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import FiltersForm from '../FiltersForm/FiltersForm';
import { filtersConfig } from './filtersConfig';
import { FilterConfigDef } from '../../utils/types';
import { useFormik } from 'formik';
import { FormControl, InputLabel } from '@mui/material';

type Props = {
  filters: Record<string, string>;
  filtersDef: Array<FilterConfigDef>;
  onFiltersApply: (filters: Record<string, string>) => void
  onFiltersReset: () => void
};

export const DynamicFilters = ({
  filters,
  filtersDef,
  onFiltersApply,
  onFiltersReset
}: Props) => {
  const { t, config } = useScopedTranslation();
  const [draftFilters, setDraftFilters] =
    useState<Record<string, string>>(filters);
  const [errors, setErrors] = useState<Array<string>>([]);

  const formik = useFormik({
    initialValues: draftFilters,
    onSubmit: async () => {
      onFiltersApply(draftFilters);
    }
  });

  useEffect(() => setDraftFilters(filters), [filters]);

  const handleErrors = useCallback((id: string, isError: boolean) => {
    setErrors((prev) =>
      isError ? (!prev?.includes(id) ? [...prev, id] : prev) : prev.filter((error) => error !== id)
    );
  }, []);

  const handleDraftFilters = useCallback(
    (id: string, value: string) => setDraftFilters(prev => {
      const newFilters = { ...prev, [id]: value }
      return Object.entries(newFilters).reduce((acc, [key, value]) => ({ ...acc, ...(value ? { [key]: value } : {}) }), {})
    }),
    []
  );

  return (
    <FiltersForm
      formik={formik}
      filtersApplied={!!Object.keys(draftFilters).length}
      onFiltersApplied={formik.handleSubmit}
      onFiltersReset={onFiltersReset}
    >
      {filtersDef.map(({ type, ...filter }) => {
        const props = {
          item: filter,
          errors,
          setErrors: handleErrors,
          filters: draftFilters,
          setFilters: handleDraftFilters,
          t,
          config
        }
        return (
          <FormControl key={filter.id} fullWidth size='small' variant="outlined">
            {type === 'select' && (
              <InputLabel id={`${filter.id}-filter-select-label`}>
                {t(filter.label ?? '')}
              </InputLabel>
            )}
            {filtersConfig?.[type](props)}
          </FormControl>
        )
      })}
    </FiltersForm>
  );
}
