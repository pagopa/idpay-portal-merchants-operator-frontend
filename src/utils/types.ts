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
    status?: string;
    page?: number;
    size?: number;
    sort?: string;
    category?: string;
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