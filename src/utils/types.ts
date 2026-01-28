export interface JwtUser {
    id?: string;
    username?: string;
    lastName?: string;
    email?: string;
    firstName?: string;
    emailVerified?: boolean;
    userProfileMetadata?: object;
}

export interface LoggedUser {
    id: string;
    name?: string;
    email?: string;
    surname?: string;
}

export interface GetProductsParams {
    productName?: string;
    fullProductName?: string;
    status?: string,
    page?: number;
    size?: number;
    sort?: string;
    category?: string, 
    eprelCode?: string;
    gtinCode?: string;
    productFileId?: string;
    organizationId?: string;
}

export interface PaginationResponse {
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    content: unknown[];
}

export interface GetProcessedTransactionsFilters {
    fiscalCode?: string;
    productGtin?: string;
    trxCode?: string;
    status?: string;
}

export interface PaginationExtendedModel {
    page: number;
    pageSize: number;
    totalElements: number;
}

export interface DecodedJwtToken {
    exp: number;
    iat: number;
    auth_time: number;
    jti: string;
    iss: string;
    aud: string;
    sub: string;
    typ: string;
    azp: string;
    sid: string;
    acr: string;
    'allowed-origins': string[];
    realm_access: {
        roles: string[];
    };
    resource_access: {
        account: {
            roles: string[];
        };
    };
    scope: string;
    email_verified: boolean;
    name: string;
    preferred_username: string;
    merchant_id: string;
    given_name: string;
    family_name: string;
    email: string;
    point_of_sale_id: string;
}

export interface transactionInProgreessDTO {
    additionalProperties: {
        productCategory: string;
        productGtin: string;
        productName: string;
    };
    channel: string;
    effectiveAmountCents: number;
    fiscalCode: string;
    id: string;
    residualAmountCents: number;
    rewardAmountCents: number;
    splitPayment: boolean;
    status: string;
    trxCode: string;
    trxDate: string;
    trxExpirationSeconds: number;
    updateDate: string;
    
}
