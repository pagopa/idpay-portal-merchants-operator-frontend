import { Box, CircularProgress, Grid } from "@mui/material";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import { useTranslation } from "react-i18next";
import DetailsCard from "../../components/DetailsCard/DetailsCard";
import { DecodedJwtToken } from "../../utils/types";
import { getPointOfSaleDetails } from "../../services/merchantService";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { authStore } from "../../store/authStore";
import { useAuth } from "../../contexts/AuthContext";
import AlertComponent from "../../components/Alert/AlertComponent";

const fetchDetails = async ({ setLoading, setErrorAlert, token, user }) => {
  const decodeToken: DecodedJwtToken = jwtDecode(token);
  setLoading(true);
  try {
    const response = await getPointOfSaleDetails(
      user.merchant_id,
      decodeToken?.point_of_sale_id
    );
    return response;
  } catch (error) {
    console.error("Error fetching details:", error);
    setErrorAlert(true)
  } finally {
    setLoading(false)
  }
};

const mapResponse = async ({ setLoading, setErrorAlert, setDetails, token, user }) => {
  const response = await fetchDetails({ setLoading, setErrorAlert, token, user });
  
  const mappedResponse = [
    {
      "ID univoco": response?.id ?? "",
      "Indirizzo": (response?.address && response?.zipCode && response?.city && response?.province && `${response.address} - ${response.zipCode}, ${response.city}, ${response.province}`) ?? "",
      "Telefono": response?.channelPhone ?? "",
      "Email": response?.channelEmail ?? "",
    },
    {
      "Nome": response?.contactName ?? "",
      "Cognome": response?.contactSurname ?? "",
      "Email": response?.contactEmail ?? "",
    },
  ];
  setDetails(mappedResponse);
};

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState();
  const [errorAlert, setErrorAlert] = useState(false);
  const { t } = useTranslation();
  const token = authStore.getState().token;

  useEffect(() => {
    if (!details) {
      mapResponse({ setLoading, setErrorAlert, setDetails, token, user });
    }
  }, [token, user, details]);

  useEffect(() => {
        if (errorAlert) {
            const timer = setTimeout(() => {
                setErrorAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorAlert]);

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
      {loading ? (<Box
         data-testid="loading"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>) : details && (
        <Grid data-testid='details-cards' container flexWrap="nowrap" flexDirection="row" spacing={2}>
          <DetailsCard title="Dati punto vendita" item={details[0]} />
          <DetailsCard title="Dati referente" item={details[1]} />
        </Grid>
      )
      } 
      
      <AlertComponent data-testid='alert-component' isOpen={errorAlert} error={true} message={t('pages.profile.errorAlert')} />
    </Box>
  );
};

export default Profile
