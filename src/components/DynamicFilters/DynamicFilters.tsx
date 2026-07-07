import { useCallback, useEffect, useState } from 'react';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import FiltersForm from '../FiltersForm/FiltersForm';
import { filtersConfig } from './filtersConfig';
import { FilterConfigDef, TemplateConfigDef } from '../../utils/types';
import { useFormik } from 'formik';

type Props = {
  filters: Record<string, { value: string; label?: string }>;
  setFilters: (id: string, value: { value: string; label?: string }) => void;
  filtersDef: Array<FilterConfigDef>;
  templateDef: TemplateConfigDef;
};

export default function FiltersDrawer({
  filters,
  setFilters,
  filtersDef,
  templateDef,
}: Props) {
  const { t } = useScopedTranslation();
  const [draftFilters, setDraftFilters] =
    useState<Record<string, { value: string; label?: string }>>(filters);
  const [errors, setErrors] = useState<Array<string>>([]);

  const formik = useFormik({
    initialValues: filtersDef.map(({id}) => ({[id]: ''})),
    onSubmit: async (values) => {
      return values
      // setFilters(values);
    },
  });
  
  useEffect(() => setDraftFilters(filters), [filters]);

  const handleErrors = useCallback((id: string, isError: boolean) => {
    setErrors((prev) =>
      isError ? (!prev?.includes(id) ? [...prev, id] : prev) : prev.filter((error) => error !== id)
    );
  }, []);

  const handleDraftFilters = useCallback(
    (id: string, value: { value: string; label?: string }) => {
      const newFilters = Object.entries(draftFilters).reduce(
        (acc, [filterKey, filterValue]) => ({
          ...acc,
          ...(filterKey !== id ? { [filterKey]: filterValue } : {}),
        }),
        value ? { [id]: value } : {}
      );
      setDraftFilters(newFilters);
    },
    [draftFilters]
  );

  return (
    <FiltersForm formik={formik}>
        {filtersDef.map(({type, ...filter}) => {
          const props = {
            item: filter,
            template: templateDef,
            errors,
            setErrors: handleErrors,
            filters,
            setFilters: handleDraftFilters,
            t,
          }
          return filtersConfig?.[type](props)
        })}
    </FiltersForm>
    // <Drawer anchor="right" open={open} data-testid="detail-drawer">
    //   <Box
    //     sx={{
    //       display: 'flex',
    //       alignItems: 'center',
    //       justifyContent: 'space-between',
    //       p: 3,
    //       minWidth: '400px',
    //       gap: 1,
    //     }}
    //   >
    //     <Typography variant="overline">{t('pages.products.filterLabels.filter')}</Typography>
    //     <IconButton
    //       data-testid="open-detail-button"
    //       onClick={() => toggleFiltersDrawer(false)}
    //       sx={{ color: 'text.secondary', ml: 'auto' }}
    //       aria-label="Close filters"
    //     >
    //       <CloseIcon />
    //     </IconButton>
    //   </Box>
    //   <Box paddingX="24px" maxWidth="417px">
    //     {filtersConfig &&
    //       filtersConfig.map(({ type, ...item }: FiltersProps) => {
    //         const template = item.options || templateMap?.[item.id] || templateConfig?.[item.id];
    //         const filtersParams = {
    //           item,
    //           t,
    //           template,
    //           errors,
    //           setErrors: handleErrors,
    //           filters: draftFilters,
    //           setFilters: handleDraftFilters,
    //         };

    //         return (
    //           <FormControl key={item.id} fullWidth size="small" margin="normal" variant="outlined">
    //             {type === 'select' && (
    //               <InputLabel id={`${item.id}-filter-select-label`}>
    //                 {t(item.labelKey ?? '')}
    //               </InputLabel>
    //             )}
    //             {filtersRender[type](filtersParams)}
    //           </FormControl>
    //         );
    //       })}

    //     <Button
    //       disabled={!Object.keys(draftFilters).length || !!errors.length}
    //       variant="outlined"
    //       fullWidth
    //       sx={{ height: 44, minWidth: 100, marginY: '24px' }}
    //       onClick={() => handleFilters(draftFilters)}
    //       data-testid="send-btn"
    //     >
    //       {t('pages.products.filterLabels.filter')}
    //     </Button>

    //     <Button
    //       disabled={!Object.keys(draftFilters).length}
    //       variant="text"
    //       fullWidth
    //       sx={{ height: 44, minWidth: 100 }}
    //       onClick={() => {
    //         handleFilters({});
    //         setErrors([]);
    //       }}
    //       data-testid="cancel-btn"
    //     >
    //       {t('pages.products.filterLabels.deleteFilters')}
    //     </Button>
    //   </Box>
    // </Drawer>
  );
}
