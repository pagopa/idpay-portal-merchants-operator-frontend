import { Box, MenuItem, Select, TextField } from '@mui/material';
import { FilterConfigDef, TemplateConfigDef } from '../../utils/types';
import { StatusChip } from '../StatusChip/StatusChip';

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
        const { id, label, template, context } = item;
        const templateDef = config(template)
        const templateLabels = templateDef.reduce((acc, { value, label }) => ({ ...acc, [value]: label }), {})
        return (
            <Select
                labelId={`${id}-filter-select-label`}
                id={`${id}-filter-select`}
                label={t(label ?? '')}
                value={filters?.[id] ?? ''}
                name={id}
                onChange={(e) => {
                    setFilters(id, e.target.value)
                }}
                renderValue={(value) => (
                    <Box
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {t(templateLabels[value])}
                    </Box>
                )}
            >
                {templateDef.map(({ label, value }) => (
                    <MenuItem key={value} value={value}>
                        {id === "status" ?
                            <StatusChip context={context} value={value?.toLowerCase()} /> :
                            t(label)}
                    </MenuItem>
                ))}
            </Select>
        );
    },
    text: ({ item, t, filters, setFilters, errors, setErrors }) => {
        const { id, label, regEx, pattern, message, inputProps } = item;
        const isError = !!filters?.[id] && errors?.includes(id);
        return (
            <TextField
                fullWidth
                size='small'
                id={`${id}-text`}
                label={t(label ?? '')}
                variant="outlined"
                value={filters?.[id] ?? ''}
                onChange={(e) => {
                    const text = pattern ? e.target.value.replace(RegExp(pattern.value, pattern?.flag), '') : e.target.value
                    const isError = !!text && !RegExp(regEx || '').test(text);
                    setFilters(id, text.trimStart());
                    setErrors(id, isError);
                }}
                error={isError}
                helperText={message && isError && t(message ?? '')}
                onPaste={(e) => {
                    e.preventDefault();
                    const text = pattern ? e.clipboardData.getData('text').replace(RegExp(pattern.value, pattern?.flag), '') : e.clipboardData.getData('text');
                    const isError = !!text && !RegExp(regEx || '').test(text);
                    setFilters(id, text.trim());
                    setErrors(id, isError);
                }}
                slotProps={{ htmlInput: inputProps }}
            />
        );
    },
};