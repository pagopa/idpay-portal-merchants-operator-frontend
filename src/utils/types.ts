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