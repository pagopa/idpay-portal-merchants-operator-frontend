import { Link, Tooltip, Typography } from '@mui/material';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

export function ExternalLink({ value, tooltip }: { value?: string; tooltip?: boolean }) {
  const label = value?.trim();
  let href: string | undefined;
  try {
    const url = new URL(label?.startsWith('www.') ? `https://${label}` : label || '');
    if (url.protocol === 'http:' || url.protocol === 'https:') href = url.href;
  } catch {
    // Missing or invalid URLs are displayed as unavailable.
  }

  return href ? (
    <Tooltip title={tooltip ? label : ''}>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'block',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: 'fontWeightMedium',
        }}
      >
        {label}
      </Link>
    </Tooltip>
  ) : (
    <Typography>{MISSING_DATA_PLACEHOLDER}</Typography>
  );
}
