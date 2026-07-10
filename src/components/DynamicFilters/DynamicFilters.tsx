import { useCallback, useEffect, useState } from 'react';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { filtersConfig } from './filtersConfig';
import { FilterConfigDef } from '../../utils/types';
import { Box, Button, FormControl, InputLabel } from '@mui/material';

type Props = {
  filters: Record<string, string>;
  setFilters: (filters: Record<string, string>) => void
  filtersDef: Array<FilterConfigDef>;
};

export const DynamicFilters = ({
  filters,
  setFilters,
  filtersDef
}: Props) => {
  const { t, config } = useScopedTranslation();
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>(filters);
  const [errors, setErrors] = useState<Array<string>>([]);

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
    <Box display="flex" flexDirection="row" columnGap="1rem" alignItems="flex-start" width="100%">
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
      <Box display="flex" flexDirection="row" alignItems="center" columnGap="1rem" minWidth="fit-content">
        <Button
          sx={{ minWidth: 'fit-content' }}
          variant="outlined"
          onClick={() => setFilters(Object.entries(draftFilters).reduce((acc, [key, value]) => ({ ...acc, [key]: value.trim()}) , {}))}
          disabled={!Object.keys(draftFilters).length || !!errors.length}
          data-testid="apply-filters-test"
        >
          {t('commons.filterBtn')}
        </Button>
        <Button
          sx={{ minWidth: 'fit-content' }}
          variant="naked"
          onClick={() => {
            setErrors([])
            if(Object.keys(filters).length) {
              setFilters({})
            } else {
              setDraftFilters({})
            }
          }}
          disabled={!Object.keys(draftFilters).length}
          data-testid="reset-filters-test"
        >
          {t('commons.removeFiltersBtn')}
        </Button>
      </Box>
    </Box>
  );
}
