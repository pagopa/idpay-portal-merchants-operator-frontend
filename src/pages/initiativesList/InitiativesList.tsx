import { Box } from "@mui/system";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import { useTranslation } from "react-i18next";

export const Initiatives = () => {
//   const [loading, setLoading] = useState(true);
//   const [details, setDetails] = useState();
//   const [errorAlert, setErrorAlert] = useState(false);
  const { t } = useTranslation();

  return (
    <Box>
      <Box mt={2} mb={4} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        <TitleBox
          title={t('pages.initiatives.title')}
          variantTitle="h4"
          subTitle={t('pages.initiatives.subtitle')}
          variantSubTitle="body2"
          mbTitle={2}
          mtTitle={0}
          mbSubTitle={2}
        />
      </Box>
    </Box>
  );
};