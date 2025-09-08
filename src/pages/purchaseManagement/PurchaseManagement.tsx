import { Box, Button, Grid, Typography, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import DataTable from "../../components/DataTable/DataTable";
import { useEffect, useState } from "react";
import Chip from "@mui/material/Chip";
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useNavigate } from "react-router-dom";
import ROUTES from "../../routes";

const PurchaseManagement = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const fakeData = createFakeData(15); // Genera 50 righe di dati
        setRows(fakeData);
        setLoading(false);
    }, []);


    const columns = [
        {
            field: 'elettrodomestico', headerName: 'Elettrodomestico', flex: 1.5, disableColumnMenu: true, renderCell: (params) => (
                <Tooltip title={params.value}>
                    <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {params.value}
                    </Typography>
                </Tooltip>
            ),
        },
        { field: 'dataEOra', headerName: 'Data e ora', flex: 1, disableColumnMenu: true },
        { field: 'beneficiario', headerName: 'Beneficiario', flex: 1.5, disableColumnMenu: true },
        { field: 'totaleDellaSpesa', headerName: 'Totale della spesa', flex: 1, disableColumnMenu: true },
        { field: 'importoAutorizzato', hìgeaderName: 'Importo autorizzato', flex: 1, disableColumnMenu: true },
        { field: 'stato', headerName: 'Stato', flex: 1, disableColumnMenu: true, renderCell: (params) => <Chip label={params.value} size="small" sx={{ backgroundColor: '#FFF5DA !important', color: '#614C15 !important' }} /> },
    ];


    const createFakeData = (count) => {
        const data = [];
        const elettrodomestici = ['Lavatrice Electrolux EW7F', 'Frigorifero Samsung RB34T', 'Asciugatrice Bosch WTH85200IT', 'Forno Microonde Candy CMW2070DW', 'Aspirapolvere Dyson V11'];
        const beneficiari = ['ASDFG643RTGFDSA', 'RTG456YUHJ5678I', 'JKLO987UIO2345P', 'ZXCVB123NM654QW', 'QAZXSWE789PLMKO'];
        const stati = ['Chiedi rimborso'];

        const getRandomDate = () => {
            const start = new Date(2020, 0, 1);
            const end = new Date();
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        };

        for (let i = 0; i < count; i++) {
            const randomDate = getRandomDate();
            const totaleSpesa = (Math.random() * 800 + 200).toFixed(2);
            const importoAutorizzato = (Number(totaleSpesa) * (Math.random() * 0.2 + 0.8)).toFixed(2); // 80% - 100% della spesa totale

            data.push({
                id: i,
                elettrodomestico: elettrodomestici[Math.floor(Math.random() * elettrodomestici.length)],
                dataEOra: `${randomDate.toLocaleDateString('it-IT')}`,
                beneficiario: beneficiari[Math.floor(Math.random() * beneficiari.length)],
                totaleDellaSpesa: `${totaleSpesa} €`,
                importoAutorizzato: `${importoAutorizzato} €`,
                stato: stati[Math.floor(Math.random() * stati.length)],
            });
        }

        return data;
    };


    return (
        <Box>
            <Box mt={2} mb={4} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <TitleBox
                    title={t('pages.purchaseManagement.title')}
                    variantTitle="h4"
                    subTitle={t('pages.purchaseManagement.subtitle')}
                    variantSubTitle='body2'
                    mbTitle={2}
                    mtTitle={0}
                    mbSubTitle={2}
                />
                <Button variant="contained" size="small" startIcon={<QrCodeIcon />} sx={{ display: 'flex', textWrap: 'nowrap' }} onClick={() => navigate(ROUTES.ACCEPT_DISCOUNT)}>Accetta buono sconto</Button>
            </Box>
            <Typography variant="h6" >
                Transazioni
            </Typography>
            <Grid container mt={2}>
                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataTable
                            rows={rows}
                            columns={columns}
                            pageSize={10}
                            rowsPerPage={10}
                            paginationModel={{
                                pageSize: 10,
                                pageNo: 0,
                                totalElements: rows.length
                            }}
                        />
                    </Box>
                </Grid>

            </Grid>
        </Box>
    );
};

export default  PurchaseManagement;