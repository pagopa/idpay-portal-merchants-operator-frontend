import { Chip, Tooltip, Typography } from '@mui/material';
import { MISSING_DATA_PLACEHOLDER } from './constants';
import { GridRenderCellParams } from '@mui/x-data-grid';

export function getStatusChip(t: any, status: string) {
  const statusMap: Record<string, { label: string; backgroundColor: string; color: string }> = {
    AUTHORIZED: {
      label: t('pages.refundManagement.authorized'),
      backgroundColor: '#EEEEEE !important',
      color: '#17324D !important',
    },
    REFUNDED: {
      label: t('pages.refundManagement.refunded'),
      backgroundColor: '#C4DCF5 !important',
      color: '#17324D !important',
    },
    CANCELLED: {
      label: t('pages.refundManagement.cancelled'),
      backgroundColor: '#FFE0E0 !important',
      color: '#761F1F !important',
    },
    CAPTURED: {
      label: t('pages.refundManagement.captured'),
      backgroundColor: '#FFF5DA !important',
      color: '#614C16 !important',
    },
    REWARDED: {
      label: t('pages.refundManagement.rewarded'),
      backgroundColor: '#E1F4E1 !important',
      color: '#224021 !important',
    },
    INVOICED: {
      label: t('pages.refundManagement.invoiced'),
      backgroundColor: '#E1F5FE !important',
      color: '#215C76 !important',
    },
  };

  const config = statusMap[status] ?? {
    label: 'Errore',
    backgroundColor: '#E1F4E1 !important',
    color: '#17324D !important',
  };

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.backgroundColor,
        color: config.color,
      }}
    />
  );
}

export function formatEuro(value: number) {
  return (
    (value / 100).toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '€'
  );
}

export function filterInputWithSpaceRule(value: string): string {
  const alnumCount = (value.match(/[a-zA-Z0-9]/g) || []).length;
  if (alnumCount < 5) {
    return value.replace(/\s/g, '');
  }
  return Array.from(value).reduce(
    (acc, char) => {
      if (char === ' ') {
        if (acc.result.length === 0) {
          return { ...acc, prevSpace: true };
        }
        if (acc.prevSpace) {
          return acc;
        }
        return {
          result: acc.result + ' ',
          prevSpace: true,
        };
      } else {
        return {
          result: acc.result + char,
          prevSpace: false,
        };
      }
    },
    { result: '', prevSpace: false }
  ).result;
}

export function downloadFileFromBase64(base64: string, fileName: string) {
  const base64Data = base64.replace(/^data:application\/pdf;base64,/, '');

  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: 'application/pdf' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const handleCodeChange = (event, formik, length, codeName) => {
  const { value } = event.target;
  const alphanumericRegex = /^[a-zA-Z0-9]*$/;

  if (!(value.includes(' ') || value.length > length)) {
    if (!alphanumericRegex.test(value)) {
      return `Il codice ${codeName} deve contenere al massimo ${length} caratteri alfanumerici.`;
    }

    formik.handleChange(event);
    return '';
  }
};

export const renderCellWithTooltip = (value: unknown) => {
  const renderableValue =
    value === null || value === undefined
      ? ''
      : typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
        ? String(value)
        : value instanceof Date
          ? value.toISOString()
          : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <Tooltip title={renderableValue}>
        <Typography
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {renderableValue}
        </Typography>
      </Tooltip>
    </div>
  );
};

export const renderMissingDataWithTooltip = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <Tooltip title={MISSING_DATA_PLACEHOLDER}>
        <Typography
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {MISSING_DATA_PLACEHOLDER}
        </Typography>
      </Tooltip>
    </div>
  );
};

export const checkTooltipValue = (params, key?: string) => {
  if (key) {
    if (params?.value?.[key]) {
      return renderCellWithTooltip(params.value?.[key]);
    }
  }
  if (params?.value) {
    return renderCellWithTooltip(params.value);
  }
  return renderMissingDataWithTooltip();
};

export const checkEuroTooltip = (params: GridRenderCellParams) => {
  if (params?.value || params?.value === 0) {
    return renderCellWithTooltip(formatEuro(params.value as number));
  }
  return renderMissingDataWithTooltip();
};

export const checkDateTooltip = (
  params: GridRenderCellParams,
  locale: string = 'it-IT',
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
) => {
  if (!params?.value) {
    return renderMissingDataWithTooltip();
  }
  const formattedDate = new Date(params.value as string | number | Date)
    .toLocaleDateString(locale, options)
    .replace(',', '');
  return renderCellWithTooltip(formattedDate);
};
