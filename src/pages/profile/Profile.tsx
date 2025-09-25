import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import { useTranslation } from "react-i18next";
import DetailsCard from "../../components/DetailsCard/DetailsCard";
import { DecodedJwtToken } from "../../utils/types";
import { getPointOfSaleDetails } from "../../services/merchantService";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { authStore } from "../../store/authStore";
import { useAuth } from "../../contexts/AuthContext";

const fetchDetails = async ({ setLoading, token, user }) => {
  const decodeToken: DecodedJwtToken = jwtDecode(token);
  try {
    setLoading(true);
    const response = await getPointOfSaleDetails(
      user.merchant_id,
      decodeToken?.point_of_sale_id
    );
    setLoading(false);
    return response;
  } catch (error) {
    console.error("Error fetching details:", error);
    setLoading(false);
  }
};

const mapResponse = async ({ setLoading, setDetails, token, user }) => {
  const response = await fetchDetails({ setLoading, token, user });
  const isEmpty = (key) => (!response?.[key] ? "-" : response[key]);

  const mappedResponse = [
    {
      "ID univoco": isEmpty("id"),
      "Indirizzo": isEmpty("address"),
      "Telefono": isEmpty("channelPhone"),
      "Email": isEmpty("channelEmail"),
    },
    {
      "Nome": isEmpty("contactName"),
      "Cognome": isEmpty("contactSurname"),
      "Email": isEmpty("contactEmail"),
    },
  ];
  setDetails(mappedResponse);
};

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState();
  const [details, setDetails] = useState();
  const { t } = useTranslation();
  const token = authStore.getState().token;

  useEffect(() => {
    if (!details) {
      mapResponse({ setLoading, setDetails, token, user });
    }
  }, [token, user, details]);

  return (
    <Box>
      <Box
        mt={2}
        mb={4}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <TitleBox
          title={t("pages.profile.title")}
          variantTitle="h4"
          subTitle={t("pages.profile.subtitle")}
          variantSubTitle="body2"
          mbTitle={2}
          mtTitle={0}
          mbSubTitle={2}
        />
      </Box>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
          data-testid="loading"
        >
          <CircularProgress />
        </Box>
      ) : details ? (
        <Grid container flexWrap="nowrap" flexDirection="row" spacing={2}>
          <DetailsCard title="Dati punto vendita" item={details[0]} />
          <DetailsCard title="Dati referente" item={details[1]} />
        </Grid>
      ) : (
        <Typography variant="body2">Nessun elemento trovato</Typography>
      )}
    </Box>
  );
};

export default Profile;
