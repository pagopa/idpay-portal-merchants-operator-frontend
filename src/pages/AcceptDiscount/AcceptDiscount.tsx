import { Box, Button, Grid, InputAdornment, TextField } from '@mui/material';
import BreadcrumbsBox from '../../components/BreadcrumbsBox/BreadcrumbsBox';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import AcceptDiscountCard from './AcceptDiscountCard';
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import ModalComponent from '../../components/Modal/ModalComponent';
import { REQUIRED_FIELD_ERROR } from '../../utils/constants';
import { getProductsList } from '../../services/merchantService';
import Autocomplete from '../../components/Autocomplete/AutocompleteComponent';
import { ProductDTO } from '../../api/generated/merchants/ProductDTO';

interface FormData {
    product: string | null;
    totalAmount: string;
    discountCode: string;
}

interface FormErrors {
    product?: boolean;
    totalAmount?: boolean;
    discountCode?: boolean;
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


    useEffect(() => {
        fetchProductsList();
    }, []);

    const fetchProductsList = async (productName?: string) => {
        try {
            const {content} = await getProductsList({productName});
            setProductsList([...content]);
        } catch (error) {
            console.log(error);
        }
    }

    const handleValidateData = () => {
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
            console.log("VALID");

        }
    };

    const handleFieldChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleChangeAutocomplete = (value: string) => {
        handleFieldChange('product', value);
        fetchProductsList(value);
    }

    const handleExpenditureFocus = () => {
       setIsExpenditureFocused(true);
    }

    const handleExpenditureBlur = () => {
        setIsExpenditureFocused(false);
      };

    return (
        <Box>
            <Box mt={2} mb={4}>
                <BreadcrumbsBox
                    backLabel={t('commons.exitBtn')} items={[]} active={false} />
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
                        onChange={(value) => handleFieldChange('product', value)}
                        inputError={!!fieldErrors.product}
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
                                    <InputAdornment position="start">€</InputAdornment>
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
                            sx={{
                                mt: 2, '& .MuiFormLabel-root.Mui-error': {
                                    color: '#5C6E82 !important',
                                },
                            }}
                            error={!!fieldErrors.discountCode} helperText={fieldErrors.discountCode ? REQUIRED_FIELD_ERROR : ""}
                            onChange={(e) => handleFieldChange('discountCode', e.target.value)}
                        />
                    </AcceptDiscountCard>
                </Grid>
            </Grid>

            <Box
                display={'flex'}
                justifyContent={'space-between'}
                gap={2}
                mt={1}
            >
                <Button variant="outlined" onClick={() => setModalIsOpen(true)} disabled>
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
