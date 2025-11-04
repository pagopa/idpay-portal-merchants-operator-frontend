import { Chip } from "@mui/material";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getStatusChip(t: any, status: string) {
    switch (status) {
        case 'AUTHORIZED':
            return <Chip
                label={t('pages.refundManagement.authorized')}
                size="small"
                sx={{ backgroundColor: '#EEEEEE !important', color: '#17324D !important' }
                }
            />
        case 'REFUNDED':
            return <Chip
                label={t('pages.refundManagement.refunded')}
                size="small"
                sx={{ backgroundColor: '#C4DCF5 !important', color: '#17324D !important' }}
            />
        case 'CANCELLED':
            return <Chip
                label={t('pages.refundManagement.cancelled')}
                size="small"
                sx={{ backgroundColor: '#FFE0E0 !important', color: '#761F1F !important' }}
            />
        case 'CAPTURED':
            return <Chip
                label={t('pages.refundManagement.captured')}
                size="small"
                sx={{ backgroundColor: '#FFF5DA !important', color: '#614C16 !important' }}
            />
        case 'REWARDED':
            return <Chip
                label={t('pages.refundManagement.rewarded')}
                size="small"
                sx={{ backgroundColor: '#E1F4E1 !important', color: '#224021 !important' }}
            />
        case 'INVOICED':
            return <Chip
                label={t('pages.refundManagement.invoiced')}
                size="small"
                sx={{ backgroundColor: '#E1F5FE !important', color: '#215C76 !important' }}
            />
        default:
            return <Chip
                label="Errore"
                size="small"
                sx={{ backgroundColor: '#E1F4E1 !important', color: '#17324D !important' }}
            />
    }
};

export function formatEuro(value: number) {
  return (
    (value / 100).toLocaleString("it-IT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "€"
  );
}

export function filterInputWithSpaceRule(value: string): string {
  const alnumCount = (value.match(/[a-zA-Z0-9]/g) || []).length;
  if (alnumCount < 5) {
    return value.replace(/\s/g, "");
  }
  return Array.from(value).reduce(
    (acc, char) => {
      if (char === " ") {
        if (acc.result.length === 0) {
          return { ...acc, prevSpace: true };
        }
        if (acc.prevSpace) {
          return acc;
        }
        return {
          result: acc.result + " ",
          prevSpace: true,
        };
      } else {
        return {
          result: acc.result + char,
          prevSpace: false,
        };
      }
    },
    { result: "", prevSpace: false }
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

  export const handleGtinChange = (event, formik) => {
  const {value} = event.target;
  const alphanumericRegex = /^[a-zA-Z0-9]*$/;

  if (!(value.includes(" ") || value.length > 14)) {
    if (!alphanumericRegex.test(value)) {
      return "Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.";
    }

    formik.handleChange(event);
    return "";
  }
};