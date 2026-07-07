import { Box, MenuItem, Select, TextField } from '@mui/material';
import { FilterConfigDef, TemplateConfigDef } from '../../utils/types';

type Props = {
    item: Omit<FilterConfigDef, 'type'>;
    t: (key: string) => string;
    config: (key: string) => TemplateConfigDef
    filters: Record<string, string>;
    setFilters: (id: string, value: string) => void;
    errors?: Array<string>;
    setErrors: (id: string, isError: boolean) => void;
};

export const filtersConfig: Record<
    'select' | 'text',
    ({ item, t, config, filters, setFilters }: Props) => JSX.Element
> = {
    select: ({ item, t, config, filters, setFilters }) => {
        const { id, label, template } = item;
        const templateDef = config(`templates.${template}`)
        return (
                <Select
                    labelId={`${id}-filter-select-label`}
                    id={`${id}-filter-select`}
                    label={t(label ?? '')}
                    value={filters?.[id] ?? ''}
                    renderValue={() => (
                        <Box
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {filters?.[id] ?? ''}
                        </Box>
                    )}
                    onChange={(e) =>
                        setFilters(id, e.target.value)
                    }
                >
                    {templateDef.map(({ label, value }) => (
                        <MenuItem key={value} value={value}> {t(label)}</MenuItem>
                    ))}
                </Select>
        );
    },
    text: ({ item, t, filters, setFilters, errors, setErrors }) => {
        const { id, label, regEx, message, inputProps } = item;
        const isError = !!filters?.[id] && errors?.includes(id);
        return (
            <TextField
                fullWidth
                id={`${id}-text`}
                size="small"
                label={t(label ?? '')}
                variant="outlined"
                value={filters?.[id] ?? ''}
                onChange={(e) => {
                    const isError = !!e.target.value && !RegExp(regEx || '').test(e.target.value);
                    setFilters(id, e.target.value);
                    setErrors(id, isError);
                }}
                error={isError}
                helperText={message && isError && t(message ?? '')}
                onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text').replace(/\s+/g, '');
                    const isError = !!text && !RegExp(regEx || '').test(text);
                    setFilters(id, text);
                    setErrors(id, isError);
                }}
                slotProps={{ htmlInput: inputProps }}
            />
        );
    },
};