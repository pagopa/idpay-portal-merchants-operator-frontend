import {Box, Button, Grid, TextField} from '@mui/material';
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import BreadcrumbsBox from '../../components/BreadcrumbsBox/BreadcrumbsBox';
import ModalComponent from '../../components/Modal/ModalComponent';
import AcceptDiscountCard from './AcceptDiscountCard';



const AcceptDiscount = () => {
    const { t } = useTranslation();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{
        product?: string;
        totalAmount?: number;
        discount?: string;
    }>({});

    useEffect(() => {
        console.log(setFieldErrors({}));
    }, []);


    return (
        <Box>
            <Box mt={2}>
                <BreadcrumbsBox
                    backLabel={t('commons.backBtn')} items={[]} />
                <TitleBox
                    title={'Accetta Buono Sconto'}
                    mtTitle={2}
                    variantTitle="h4"
                    subTitle={"Compila i campi per accettare i buoni sconto ed usufruire dell' iniziativa"}
                />
            </Box>
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={12} lg={12}>
                    <AcceptDiscountCard
                        titleBox={"Seleziona il prodotto soggetto all'iniziativa"}
                        inputTitle={"Seleziona il prodotto"}
                    >
                     <TextField variant="outlined" label={"Cerca"} sx={{mt: 2}} size='small'/>
                    </AcceptDiscountCard>
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <AcceptDiscountCard
                        titleBox={"Qual'è l'importo totale della spesa?"}
                        subTitleBox={"Inserisci l'importo totale della spesa,ci servirà per calcolare lo sconto massimo applicabile."}
                    >
                        <TextField variant="outlined" label={"Importo della spesa"} size='small' />
                    </AcceptDiscountCard>
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <AcceptDiscountCard
                        titleBox={"Qual'è il codice sconto?"}
                        subTitleBox={"Inserisci il codice sconto generato dal cliente."}
                        inputTitle={"Inserisci codice sconto"}
                    >
                        <TextField variant="outlined" label={"Codice sconto"} size='small' sx={{mt: 2}}/>
                    </AcceptDiscountCard>
                </Grid>
            </Grid>
            <Box
                 display={'flex'}
                 justifyContent={'flex-end'}
                 gap={2}
                 mt={1}
            >
                <Button variant="outlined" onClick={() => setModalIsOpen(true)}>
                    {'Indietro'}
                </Button>
                <Button
                    disabled={Object.values(fieldErrors).some((msg) => msg)}
                    variant="contained"

                >
                    {'Conferma'}
                </Button>
            </Box>
            <ModalComponent
                open={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
            >
                <Box
                     display={'flex'}
                     justifyContent={'flex-end'}
                     gap={2}
                     mt={1}
                >
                    <Button variant="outlined" onClick={() => setModalIsOpen(false)}>
                        {'Torna indietro'}
                    </Button>
                    <Button
                        variant="contained"
                    >
                        {'Esci'}
                    </Button>
                </Box>
            </ModalComponent>
        </Box>
    );
};

export default AcceptDiscount;
