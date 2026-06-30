import { Box } from "@mui/system";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import { useAppSelector } from "../../redux/hooks";
import { initiativesListSelector } from "../../redux/slices/initiativesSlice";
import { columns } from "./columns";
import { useScopedTranslation } from "../../hooks/useScopedTranslation";
import { useEffect, useState } from "react";
import { DataGrid, GridSortModel } from "@mui/x-data-grid";
import { theme } from "@pagopa/mui-italia";
import { InputAdornment, Paper, TextField, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

export const InitiativesList = () => {
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'initiativeName', sort: 'asc' }]);
  const [initiativeListFiltered, setInitiativeListFiltered] = useState([]);
  const { t } = useScopedTranslation();
  const initiativesList = useAppSelector(initiativesListSelector);

  useEffect(() => {
    setInitiativeListFiltered(initiativesList);
  }, [initiativesList]);

  const handleSearchInitiatives = (s: string) => {
    const search = s.toLocaleLowerCase();
    if (search.length > 0) {
      const listFiltered = [];
      initiativesList?.forEach((record) => {
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
          title={t('commons.pages.initiatives.title')}
          variantTitle="h4"
          subTitle={t('commons.pages.initiatives.subtitle')}
          variantSubTitle="body2"
          mbTitle={2}
          mtTitle={0}
          mbSubTitle={2}
        />
        <TextField
          id="search-initiative"
          placeholder={t('commons.pages.initiatives.search')}
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
        {!initiativeListFiltered.length ?
          <Paper
            sx={{
              my: 4,
              p: 3,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2">{t('commons.pages.initiatives.emptyList')}</Typography>
          </Paper> :
          <DataGrid
            columns={columns}
            rows={initiativeListFiltered}
            getRowId={row => row.initiativeId}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            sortingOrder={['asc', 'desc']}
            hideFooterPagination
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-row': {
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                },
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-cell:focus-within': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeader:focus': {
                outline: 'none',
              },
            }}
          />}
      </Box>
    </Box>
  );
};