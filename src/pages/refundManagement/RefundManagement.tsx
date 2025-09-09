import { Box, Button, Grid, Typography, Tooltip, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import DataTable from "../../components/DataTable/DataTable";
import { useEffect, useState } from "react";
import Chip from "@mui/material/Chip";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../routes";
import FiltersForm from "../../components/FiltersForm/FiltersForm";
import { useFormik } from "formik";

const RefundManagement = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const initialValues = {
        fiscalCode: '',
        gtiIn: '',
        status: null
    };

    const formik = useFormik({
        initialValues,
        onSubmit: (values) => {
            console.log('Eseguo ricerca con filtri:', values);
        }
    });

    useEffect(() => {
        setLoading(true);
        const fakeData = createFakeData(10); // Genera 10 righe di dati
        setRows(fakeData);
        setLoading(false);
    }, []);


    const columns = [
        {
            field: 'elettrodomestico', headerName: 'Elettrodomestico', flex: 1.5, disableColumnMenu: true, align: 'center', renderCell: (params: any) => (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center', 
                        height: '100%',       
                        width: '100%'          
                    }}
                >
                    <Tooltip title={params.value}>
                        <Typography
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                            {params.value}
                        </Typography>
                    </Tooltip>
                </div>
            ),
        },
        { field: 'dataEOra', headerName: 'Data e ora', flex: 1, disableColumnMenu: true },
        { field: 'beneficiario', headerName: 'Beneficiario', flex: 1.5, disableColumnMenu: true },
        { field: 'totaleDellaSpesa', headerName: 'Totale della spesa', flex: 1, disableColumnMenu: true },
        { field: 'importoAutorizzato', headerName: 'Importo autorizzato', flex: 1, disableColumnMenu: true },
        { field: 'stato', headerName: 'Stato', flex: 1, disableColumnMenu: true, renderCell: (params) => <Chip label={params.value} size="small" sx={{ backgroundColor: '#FFE0E0 !important', color: '#761F1F !important' }} /> },
    ];


    const createFakeData = (count) => {
        const data = [];
        const elettrodomestici = ['Lavatrice Electrolux EW7F', 'Frigorifero Samsung RB34T', 'Asciugatrice Bosch WTH85200IT', 'Forno Microonde Candy CMW2070DW', 'Aspirapolvere Dyson V11'];
        const beneficiari = ['ASDFG643RTGFDSA', 'RTG456YUHJ5678I', 'JKLO987UIO2345P', 'ZXCVB123NM654QW', 'QAZXSWE789PLMKO'];
        const stati = ['Annullato'];

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
                    title={t('pages.refundManagement.title')}
                    variantTitle="h4"
                    subTitle={t('pages.refundManagement.subtitle')}
                    variantSubTitle='body2'
                    mbTitle={2}
                    mtTitle={0}
                    mbSubTitle={2}
                />
            </Box>
            <Typography variant="h6" >
                Transazioni
            </Typography>
            <Box>
                <FiltersForm
                    formik={formik}
                    onFiltersApplied={(filters) => { console.log("FILTERS", filters) }}
                    onFiltersReset={() => { }}
                >
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                        <TextField name="fiscalCode" label="Cerca per codice fiscale" size="small" value={formik.values.fiscalCode} onChange={formik.handleChange}></TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                        <TextField name="gtiIn" label="Cerca per GTI In" size="small" value={formik.values.gtiIn} onChange={formik.handleChange}></TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="pos-type-label">Stato</InputLabel>
                            <Select
                                labelId="pos-type-label"
                                id="pos-type-select"
                                label="Stato"
                                name="status"
                                value={formik.values.status}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <MenuItem value=""><em>Tutti gli stati</em></MenuItem>
                                <MenuItem value="PHYSICAL">
                                    <Chip label="Annullato" size="small" sx={{ backgroundColor: '#FFE0E0 !important', color: '#761F1F !important' }} />
                                </MenuItem>
                                <MenuItem value="ONLINE">
                                    <Chip label="Stornato" size="small" sx={{ backgroundColor: '#C4DCF5 !important', color: '##17324D !important' }} />
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </FiltersForm>
            </Box>
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

export default RefundManagement;