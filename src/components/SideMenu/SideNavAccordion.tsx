import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, List, ListItemText, Tooltip } from '@mui/material';
import { config } from './config';
import SideNavItem from './SideNavItem';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { PointOfSaleInitiativeDetailedDTO } from '../../api/generated/data-contracts';

type Props = {
    item: PointOfSaleInitiativeDetailedDTO;
    isOpen?: boolean
    defaultOpen?: boolean
};

export const SideNavAccordion = ({ item, isOpen, defaultOpen }: Props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useScopedTranslation();
    const { initiativeId, initiativeName } = item;
    const capitalLetters = initiativeName.split('').filter((letter) => letter.match(/[A-Z]/)).join('')

    const isAccordionExpanded = location.pathname.includes(`/${initiativeId}`) || defaultOpen

    return (
        <Accordion
            expanded={isAccordionExpanded}
            disableGutters
            elevation={0}
            sx={{
                border: 'none',
                '&:before': { backgroundColor: '#fff' },
                width: '100%'
            }}
            onChange={(e) => {
                e.stopPropagation();
                navigate(config[0].route.replace(':initiativeId', initiativeId), { replace: true })
            }}
            data-testid="accordion-click-test"
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${initiativeId}-content`}
                id={`panel-${initiativeId}-header`}
            >
                {!isOpen ?
                    <Tooltip title={initiativeName}>
                        <ListItemText sx={{ wordBreak: 'break-word' }} primary={capitalLetters} />
                    </Tooltip> :
                    <ListItemText sx={{ wordBreak: 'break-word' }} primary={initiativeName} />
                }
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
                <List disablePadding>
                    {config.map(({ key, title, route, icon, dataTestId }) => {
                        const path = route.replace(':initiativeId', initiativeId)
                        return <SideNavItem
                            key={key}
                            title={t(title)}
                            handleClick={() => navigate(path, { replace: true })}
                            isSelected={location.pathname === path}
                            icon={icon}
                            level={0}
                            data-testid={dataTestId}
                            hideLabels={!isOpen}
                        />
                    })}
                </List>
            </AccordionDetails>
        </Accordion>
    );
};
