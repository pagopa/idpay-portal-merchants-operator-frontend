import { Box, Button, Grid, TextField } from '@mui/material';
import BreadcrumbsBox from '../../components/BreadcrumbsBox/BreadcrumbsBox';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import AcceptDiscountCard from './AcceptDiscountCard';
import { useTranslation } from "react-i18next";
import { useState } from "react";
import ModalComponent from '../../components/Modal/ModalComponent';
import { REQUIRED_FIELD_ERROR } from '../../utils/constants';

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
        if(isValid){
            console.log("VALID");
        }
      };

      const handleFieldChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
                        <TextField
                            variant="outlined"
                            label={t('pages.acceptDiscount.search')}
                            size='small'
                            sx={{
                                mt: 2, '& .MuiFormLabel-root.Mui-error': {
                                    color: '#5C6E82 !important',
                                },
                            }}
                            error={!!fieldErrors.product} helperText={fieldErrors.product ? REQUIRED_FIELD_ERROR : ""} 
                            onChange={(e) => handleFieldChange('product', e.target.value)}
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
                            sx={{
                                '& .MuiFormLabel-root.Mui-error': {
                                    color: '#5C6E82 !important',
                                }
                            }}
                            error={!!fieldErrors.totalAmount} helperText={fieldErrors.totalAmount ? REQUIRED_FIELD_ERROR : ""}
                            onChange={(e) => handleFieldChange('totalAmount', e.target.value)}
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
