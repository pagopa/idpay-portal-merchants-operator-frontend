import { Box } from "@mui/system";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import { useAppSelector } from "../../redux/hooks";
import { initiativesListSelector } from "../../redux/slices/initiativesSlice";
import { useScopedTranslation } from "../../hooks/useScopedTranslation";
import { useEffect, useMemo, useState } from "react";
import { GridColDef, GridSortModel } from "@mui/x-data-grid";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { DynamicTable } from "../../components/DynamicTable/DynamicTable";
import ROUTES from "../../routes";

export const InitiativesList = () => {
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'initiativeName', sort: 'asc' }]);
  const [initiativeListFiltered, setInitiativeListFiltered] = useState([]);
  const { t, config } = useScopedTranslation();
  const columns = config('commons.pages.initiativesList.initiativeTable.columns') as Array<GridColDef & { cell: Record<string, string> }>
  const initiativesList = useAppSelector(initiativesListSelector);
  const mappedInitiativesList = useMemo(() =>
    initiativesList.map((initiative) =>
      ({ ...initiative, key: 'initiative', route: ROUTES.BUY_MANAGEMENT.replace(':initiativeId', initiative.initiativeId) })),
    [initiativesList])

  useEffect(() => {
    setInitiativeListFiltered(mappedInitiativesList);
  }, [initiativesList, mappedInitiativesList]);

  const handleSearchInitiatives = (s: string) => {
    const search = s.toLocaleLowerCase();
    if (search.length > 0) {
      const listFiltered = [];
      mappedInitiativesList?.forEach((record) => {
        if (record?.initiativeName?.toLowerCase().includes(search)) {
          listFiltered.push(record);
        }
      });
      setInitiativeListFiltered([...listFiltered]);
    } else {
      if (Array.isArray(initiativesList)) {
        setInitiativeListFiltered([...initiativesList]);
      }
    }
  };

  return (
    <Box>
      <Box mt={2} mb={4} display={'flex'} flexDirection="column" rowGap="1.5rem">
        <TitleBox
          title={t('commons.pages.initiativesList.title')}
          variantTitle="h4"
          subTitle={t('commons.pages.initiativesList.subtitle')}
          variantSubTitle="body2"
          mbTitle={2}
          mtTitle={0}
          mbSubTitle={2}
        />
        <TextField
          id="search-initiative"
          placeholder={t('commons.pages.initiativesList.search')}
          variant="outlined"
          size="small"
          data-testid='search-initiatives'
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          onChange={(e) => {
            handleSearchInitiatives(e.target.value);
          }}
        />
        <DynamicTable
          columnsDef={columns}
          rows={initiativeListFiltered}
          getRowId={row => row.initiativeId}
          emptyText='commons.pages.initiativesList.emptyList'
          isEmpty={!initiativeListFiltered.length}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          sortingOrder={['asc', 'desc']}
          hideFooterPagination />
      </Box>
    </Box>
  );
};