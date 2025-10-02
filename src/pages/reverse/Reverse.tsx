import { Box } from '@mui/material';
import BreadcrumbsBox from '../../components/BreadcrumbsBox/BreadcrumbsBox';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../routes';

const Reverse = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    return (
        <Box>
            <BreadcrumbsBox
                backLabel={t('commons.exitBtn')} items={['Gestione acquisti', 'Storna transazione']} active={true} onClickBackButton={() => navigate(ROUTES.BUY_MANAGEMENT)} />
            <TitleBox
                title={t('pages.reverse.title')}
                mtTitle={2}
                variantTitle="h4"
                subTitle={t('pages.reverse.subtitle')}
                variantSubTitle='body2'
            />
        </Box>
    );
};

export default Reverse;
