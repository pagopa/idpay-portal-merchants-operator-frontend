import { Box, Button, Grid, InputAdornment, TextField, Backdrop, CircularProgress, Typography } from '@mui/material';
import BreadcrumbsBox from '../../components/BreadcrumbsBox/BreadcrumbsBox';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import AcceptDiscountCard from './AcceptDiscountCard';
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import ModalComponent from '../../components/Modal/ModalComponent';
import { REQUIRED_FIELD_ERROR } from '../../utils/constants';
import { getProductsList, previewPayment } from '../../services/merchantService';
import Autocomplete from '../../components/Autocomplete/AutocompleteComponent';
import { ProductDTO } from '../../api/generated/merchants/ProductDTO';
import AlertComponent from '../../components/Alert/AlertComponent';
import { useNavigate } from 'react-router-dom';
import EuroIcon from '@mui/icons-material/Euro';
import ROUTES from '../../routes';

interface FormData {
    product: ProductDTO | null;
    totalAmount: string;
    discountCode: string;
}

interface FormErrors {
    product?: boolean;
    totalAmount?: boolean;
    discountCode?: boolean;
    discountCodeWrong?: boolean;
}


const AcceptDiscount = () => {
    const { t } = useTranslation();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<FormData>({
        product: null,
        totalAmount: '',
        discountCode: '' 
    });
    const [productsList, setProductsList] = useState<ProductDTO[]>([]);
    const [isExpenditureFocused, setIsExpenditureFocused] = useState(false);
    const [errorAlert, setErrorAlert] = useState(false);
    const [previewIsLoading, setPreviewIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if(sessionStorage.getItem('discountCoupon')) {
            const discountCoupon = JSON.parse(sessionStorage.getItem('discountCoupon')!);
            setFormData({
                product: discountCoupon.product,
                totalAmount: (discountCoupon.originalAmountCents / 100).toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }),
                discountCode: discountCoupon.trxCode
            });
        }
    }, []);

    useEffect(() => {
        if (errorAlert) {
            const timer = setTimeout(() => {
                setErrorAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorAlert]);

    const fetchProductsList = async (productName?: string) => {
        try {
            const { content } = await getProductsList({ productName, size: 50 });
            setProductsList([...content]);
        } catch (error) {
            console.log(error);
            setProductsList([]);
        }
    }

    const handleValidateData = async () => {
        const errors: Record<string, boolean> = {};
        let isValid = true;

        if (!formData.product) {
            errors.product = true;
            isValid = false;
        }
        if (!formData.totalAmount) {
            errors.totalAmount = true;
            isValid = false;
        }
        if (!formData.discountCode) {
            errors.discountCode = true;
            isValid = false;
        }

        setFieldErrors(errors);
        if (isValid) {
            setPreviewIsLoading(true);
            try {
                const response = await previewPayment({ productGtin: formData.product!.gtinCode!, productName: formData.product!.productName!, amountCents: Math.round(Number(formData.totalAmount.replace(',', '.')) * 100), discountCode: formData.discountCode.trim()! });
                    sessionStorage.setItem('discountCoupon', JSON.stringify({...response, product: formData.product}));
                    setPreviewIsLoading(false);
                    navigate('/accetta-buono-sconto/riepilogo');
            } catch (error) {
                console.error('Error in previewPayment:', error);
                if(error.response.data.code === 'PAYMENT_NOT_FOUND_OR_EXPIRED' || error.response.data.code === 'PAYMENT_ALREADY_AUTHORIZED') {
                    const errors: Record<string, boolean> = {};
                    errors.discountCodeWrong = true;
                    setFieldErrors(errors);
                    setPreviewIsLoading(false);
                } else {
                    setErrorAlert(true);
                    setPreviewIsLoading(false);
                }
            }
        }
        return isValid;
    };

    const handleFieldChange = (field: keyof FormData, value: any) => {
        const newValue = value;
        if (field === 'totalAmount') {
            if (newValue === '') {
                setFormData(prev => ({
                    ...prev,
                    [field]: newValue
                }));
                return;
            }
        
            const parts = newValue.split(',');
            if (parts.length > 2) {
                return;
            }
        
            const integerPart = parts[0];
            const decimalPart = parts[1] ?? '';
        

            if (integerPart && integerPart.split('').some(ch => ch < '0' || ch > '9')) {
                return;
            }
        
            if (decimalPart.length > 2 || decimalPart.split('').some(ch => ch < '0' || ch > '9')) {
                return;
            }

            console.log("VAL", typeof(newValue))
        
            setFormData(prev => ({
                ...prev,
                [field]: newValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: newValue
            }));
        }

    };

    const handleChangeAutocomplete = (value: string) => {
        fetchProductsList(value);
    }

    const handleExpenditureFocus = () => {
        setIsExpenditureFocused(true);
    }

    const handleExpenditureBlur = () => {
        setIsExpenditureFocused(false);
    };

    const handleExitPage = () => {
        sessionStorage.removeItem('discountCoupon');
        navigate(ROUTES.BUY_MANAGEMENT);
    }

    return (
        <>
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={previewIsLoading}
                onClick={() => setPreviewIsLoading(false)}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Box sx={{ margin: '20px'}}>
                <Box mt={2} mb={4}>
                    <BreadcrumbsBox
                        backLabel={t('commons.exitBtn')} items={[]} active={true} onClickBackButton={() => setModalIsOpen(true)} />
                    <TitleBox
                        title={t('pages.acceptDiscount.title')}
                        mtTitle={2}
                        variantTitle="h4"
                        subTitle={t('pages.acceptDiscount.subtitle')}
                        variantSubTitle='body2'
                    />
                </Box>
                <Grid container spacing={2} mb={3}>
                    <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                        <AcceptDiscountCard
                            titleBox={t('pages.acceptDiscount.selectProduct')}
                            inputTitle={t('pages.acceptDiscount.selectProductTitle')}
                        >
                            <Autocomplete
                                options={productsList}
                                onChangeDebounce={(value) => handleChangeAutocomplete(value)}
                                onChange={(productObj) => handleFieldChange('product', productObj)}
                                inputError={!!fieldErrors.product}
                                value={formData.product}
                            />


                        </AcceptDiscountCard>
                    </Grid>
                    <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                        <AcceptDiscountCard
                            titleBox={t('pages.acceptDiscount.expenseAmount')}
                            subTitleBox={t('pages.acceptDiscount.insertAmount')}
                        >
                            <TextField
                                variant="outlined"
                                label={t('pages.acceptDiscount.expenditureAmount')}
                                size='small'
                                value={formData.totalAmount}
                                onFocus={handleExpenditureFocus}
                                onBlur={handleExpenditureBlur}
                                sx={{
                                    '& .MuiFormLabel-root.Mui-error': {
                                        color: '#5C6E82 !important',
                                    }
                                }}
                                error={!!fieldErrors.totalAmount} helperText={fieldErrors.totalAmount ? REQUIRED_FIELD_ERROR : ""}
                                onChange={(e) => handleFieldChange('totalAmount', e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: isExpenditureFocused || formData.totalAmount ? (
                                            <InputAdornment position="start" ><EuroIcon fontSize='small'/></InputAdornment>
                                        ) : null,
                                    },
                                    inputLabel: {
                                        shrink: Boolean(isExpenditureFocused || formData.totalAmount),
                                    },
                                }}
                            />
                        </AcceptDiscountCard>
                    </Grid>
                    <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                        <AcceptDiscountCard
                            titleBox={t('pages.acceptDiscount.whatDiscountCode')}
                            subTitleBox={t('pages.acceptDiscount.insertDiscountCode')}
                            inputTitle={"Inserisci codice sconto"}
                        >
                            <TextField
                                variant="outlined"
                                label={t('pages.acceptDiscount.discountCode')}
                                size='small'
                                value={formData.discountCode}
                                sx={{
                                    mt: 2, '& .MuiFormLabel-root.Mui-error': {
                                        color: '#5C6E82 !important',
                                    },
                                }}
                                error={!!fieldErrors.discountCode || !!fieldErrors.discountCodeWrong} helperText={fieldErrors.discountCode ? REQUIRED_FIELD_ERROR :  fieldErrors.discountCodeWrong ? "Codice sconto non valido" : ""}
                                onChange={(e) => handleFieldChange('discountCode', e.target.value)}
                            />
                        </AcceptDiscountCard>
                    </Grid>
                </Grid>

                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    gap={2}
                    mt={4}
                >
                    <Button variant="outlined" onClick={() => setModalIsOpen(true)} >
                        {'Indietro'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleValidateData}

                    >
                        {t('commons.continueBtn')}
                    </Button>
                </Box>
                <ModalComponent
                    open={modalIsOpen}
                    onClose={() => setModalIsOpen(false)}
                >
                    <Box display={'flex'} flexDirection={'column'} gap={2}>
                        <Typography variant="h6">{t('pages.acceptDiscount.modalTitle')}</Typography>
                        <Typography variant="body1">{t('pages.acceptDiscount.modalDescription')}</Typography>
                    </Box>
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
                            onClick={handleExitPage}
                        >
                            {'Esci'}
                        </Button>
                    </Box>
                </ModalComponent>
                {
                    errorAlert && <AlertComponent error={true} message={t('pages.acceptDiscount.errorAlert')} />
                }
            </Box>
        </>
    );
};

export default AcceptDiscount;

