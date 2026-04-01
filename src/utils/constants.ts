export const testToken = '';

const IS_DEVELOP = import.meta.env.DEV;
export const MOCK_USER = IS_DEVELOP;
export const LOG_REDUX_ACTIONS = IS_DEVELOP;

export const DEBUG_CONSOLE = IS_DEVELOP;

export const MISSING_DATA_PLACEHOLDER = "-";
export const REQUIRED_FIELD_ERROR = "Campo obbligatorio";

export const ELEMENT_PER_PAGE = [10, 25, 50, 100]