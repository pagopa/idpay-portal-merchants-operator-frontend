import { Box } from "@mui/system";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import DataTable from "../../components/DataTable/DataTable";
import { useAppSelector } from "../../redux/hooks";
import { initiativesListSelector } from "../../redux/slices/initiativesSlice";
import { columns } from "./columns";
import { ELEMENT_PER_PAGE } from "../../utils/constants";
import { useScopedTranslation } from "../../hooks/useScopedTranslation";

export const Initiatives = () => {
  //   const [loading, setLoading] = useState(true);
  //   const [details, setDetails] = useState();
  //   const [errorAlert, setErrorAlert] = useState(false);
  const { t } = useScopedTranslation();
  const initiativesList = useAppSelector(initiativesListSelector);

  return (
    <Box>
      <Box mt={2} mb={4} display={'flex'} flexDirection="column">
        <TitleBox
          title={t('commons.pages.initiatives.title')}
          variantTitle="h4"
          subTitle={t('commons.pages.initiatives.subtitle')}
          variantSubTitle="body2"
          mbTitle={2}
          mtTitle={0}
          mbSubTitle={2}
        />
        <Box>
        <DataTable
          columns={columns}
          rows={initiativesList}
          customUniqueField="initiativeId"
          // paginationModel={paginationModel}
          // onPaginationPageChange={handlePaginationChange}
          // sortModel={sortModel}
          // onSortModelChange={handleSortModelChange}
          // handleRowAction={handleRowAction}
          externalPageSizeOptions={ELEMENT_PER_PAGE}
        />
        </Box>
      </Box>
    </Box>
  );
};