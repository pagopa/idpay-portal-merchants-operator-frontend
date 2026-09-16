export const testToken = '';

const IS_DEVELOP = import.meta.env.DEV;
export const MOCK_USER = IS_DEVELOP;
export const LOG_REDUX_ACTIONS = IS_DEVELOP;
export const BASE_ROUTE = '/esercente'

export const DEBUG_CONSOLE = false;

export const MISSING_DATA_PLACEHOLDER = '-';
export const REQUIRED_FIELD_ERROR = 'Campo obbligatorio';

export const ELEMENT_PER_PAGE = [10, 25, 50, 100];

export const PAYMENT_ERROR_MESSAGES = {
  PAYMENT_NOT_FOUND_OR_EXPIRED: 'pages.acceptDiscount.discountCodeErrors.notFound',
  PAYMENT_ALREADY_AUTHORIZED: 'pages.acceptDiscount.discountCodeErrors.alreadyAuthorized',
  PAYMENT_NOT_ALLOWED_FOR_TRX_STATUS: 'pages.acceptDiscount.discountCodeErrors.notValid',
  PAYMENT_USER_UNSUBSCRIBED: 'pages.acceptDiscount.discountCodeErrors.notValid'
}
