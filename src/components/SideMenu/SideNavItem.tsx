import { ListItemButton, ListItemText, ListItemIcon, Icon, Tooltip } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
    
type Props = {
  handleClick: () => void;
  title: string;
  isSelected?: boolean;
  icon: SvgIconComponent;
  level: number;
  disabled?: boolean;
  hideLabels?: boolean;
};

export default function SideNavItem({
  handleClick,
  title,
  isSelected,
  icon,
  level,
  disabled = false,
  hideLabels = false
}: Props) {
  return (
    <ListItemButton selected={isSelected} disabled={disabled} onClick={handleClick}>
      <ListItemIcon sx={{ ml: level }}>
        {
          hideLabels ? (
            <Tooltip title={title}>
              <Icon component={icon} />
            </Tooltip>
          ) : (<Icon component={icon} />)
        }
      </ListItemIcon>
      {!hideLabels && <ListItemText
        primary={title}
        sx={{
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          textAlign: 'left',
          display: 'block',
        }}
      />}
    </ListItemButton>
  );
}
