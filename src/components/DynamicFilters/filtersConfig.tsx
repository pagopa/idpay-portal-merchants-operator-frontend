import { Box, MenuItem, Select, TextField } from '@mui/material';
import { FilterConfigDef, TemplateConfigDef } from '../../utils/types';

type Props = {
    item: Omit<FilterConfigDef, 'type'>;
    t: (key: string) => string;
    filters: Record<string, { value: string; label?: string }>;
    setFilters: (id: string, value: { value: string; label?: string }) => void;
    errors?: Array<string>;
    setErrors: (id: string, isError: boolean) => void;
    template?: TemplateConfigDef;
};

export const filtersConfig: Record<
    'select' | 'text',
    ({ item, t, filters, setFilters, template }: Props) => JSX.Element
> = {
    select: ({ item, t, filters, setFilters, template }) => {
        const { id, label } = item;
        return (
            <Select
                labelId={`${id}-filter-select-label`}
                id={`${id}-filter-select`}
                label={t(label ?? '')}
                value={filters?.[id]?.value ?? ''}
                renderValue={() => (
                    <Box
                        sx={{
                            maxWidth: '95%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {filters?.[id]?.label ?? ''}
                    </Box>
                )}
                onChange={(e) =>
                    setFilters(id, {
                        value: e.target.value,
                        label: ''
                    })
                }
            >
                {template.map(({ label, value }) => (
                    <MenuItem key={value} value={value}> {t(label)}</MenuItem>
                ))}
            </Select>
        );
    },
    text: ({ item, t, filters, setFilters, errors, setErrors }) => {
        const { id, label, regEx, message, inputProps } = item;
        const isError = !!filters?.[id]?.value && errors?.includes(id);
        return (
            <TextField
                fullWidth
                id={`${id}-text`}
                size="small"
                label={t(label ?? '')}
                variant="outlined"
                value={filters?.[id]?.value}
                onChange={(e) => {
                    const isError = !!e.target.value && !RegExp(regEx || '').test(e.target.value);
                    setFilters(id, { value: e.target.value });
                    setErrors(id, isError);
                }}
                error={isError}
                helperText={message && isError && t(message ?? '')}
                onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text').replace(/\s+/g, '');
                    const isError = !!text && !RegExp(regEx || '').test(text);
                    setFilters(id, { value: text });
                    setErrors(id, isError);
                }}
                slotProps={{ htmlInput: inputProps }}
            />
        );
    },
};