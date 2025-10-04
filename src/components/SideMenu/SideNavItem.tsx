import { ListItemButton, ListItemText, ListItemIcon, Icon } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

type Props = {
  handleClick: () => void;
  title: string;
  isSelected?: boolean;
  icon: SvgIconComponent;
  disabled?: boolean;
  hideLabels?: boolean;
};

export default function SideNavItem({
  handleClick,
  title,
  isSelected,
  icon,
  disabled = false,
  hideLabels = false,
}: Props) {
  return (
    <ListItemButton selected={isSelected} disabled={disabled} onClick={handleClick} sx={{justifyContent: hideLabels ? 'center' : ''}}>
      <ListItemIcon >
        <Icon component={icon} />
      </ListItemIcon>
      {!hideLabels && <ListItemText
        primary={title}
        sx={{
          height: '100%',
          width: '100%',
          display: hideLabels ? 'grid' : '',
          justifyContent: hideLabels ? 'center' : '',
        }}
      />}
    </ListItemButton>
  );
}
