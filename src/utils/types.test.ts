import { describe, it, expect } from "vitest";
import {
    JwtUser,
    LoggedUser,
    GetProductsParams,
    PaginationResponse,
    GetProcessedTransactionsFilters,
    PaginationExtendedModel,
    DecodedJwtToken,
    transactionInProgreessDTO
} from "./types"; // importa il file contenente le interfacce

describe("TypeScript Interfaces", () => {
    it("should create a valid JwtUser object", () => {
        const user: JwtUser = {
            id: "123",
            username: "testuser",
            email: "test@example.com",
            firstName: "Mario",
            lastName: "Rossi",
            emailVerified: true,
            userProfileMetadata: { role: "admin" }
        };

        expect(user.id).toBe("123");
        expect(user.emailVerified).toBe(true);
        expect(user.userProfileMetadata).toHaveProperty("role", "admin");
    });

    it("should create a LoggedUser object", () => {
        const loggedUser: LoggedUser = {
            id: "u1",
            name: "Mario",
            surname: "Rossi",
            email: "mario.rossi@example.com"
        };

        expect(loggedUser).toHaveProperty("surname", "Rossi");
    });

    it("should create GetProductsParams with optional filters", () => {
        const params: GetProductsParams = {
            productName: "Frigorifero",
            category: "Elettrodomestico",
            page: 0,
            size: 10,
            sort: "productName,asc"
        };

        expect(params.page).toBe(0);
        expect(params.category).toBe("Elettrodomestico");
    });

    it("should create a valid PaginationResponse object", () => {
        const response: PaginationResponse = {
            pageNo: 0,
            pageSize: 10,
            totalElements: 50,
            totalPages: 5,
            content: [{ id: "trx1" }]
        };

        expect(response.content.length).toBe(1);
        expect(response.totalPages).toBe(5);
    });

    it("should create a transactionInProgreessDTO object", () => {
        const trx: transactionInProgreessDTO = {
            id: "trx123",
            trxCode: "CODE123",
            status: "AUTHORIZED",
            fiscalCode: "RSSMRA80A01H501I",
            trxDate: new Date().toISOString(),
            updateDate: new Date().toISOString(),
            trxExpirationSeconds: 3600,
            effectiveAmountCents: 15000,
            rewardAmountCents: 5000,
            residualAmountCents: 10000,
            splitPayment: false,
            channel: "POS",
            additionalProperties: {
                productCategory: "Elettrodomestico",
                productGtin: "12345678901234",
                productName: "Frigorifero Modello X"
            }
        };

        expect(trx.status).toBe("AUTHORIZED");
        expect(trx.additionalProperties.productName).toBe("Frigorifero Modello X");
    });

    it("should create a DecodedJwtToken object", () => {
        const token: DecodedJwtToken = {
            exp: 9999999999,
            iat: 1111111111,
            auth_time: 1111111111,
            jti: "abc123",
            iss: "issuer",
            aud: "audience",
            sub: "sub",
            typ: "Bearer",
            azp: "azp",
            sid: "sid",
            acr: "acr",
            "allowed-origins": ["*"],
            realm_access: { roles: ["admin"] },
            resource_access: { account: { roles: ["user"] } },
            scope: "openid",
            email_verified: true,
            name: "Mario Rossi",
            preferred_username: "mrossi",
            merchant_id: "MERCH123",
            given_name: "Mario",
            family_name: "Rossi",
            email: "mario.rossi@example.com",
            point_of_sale_id: "POS123"
        };

        expect(token.realm_access.roles).toContain("admin");
        expect(token.email_verified).toBe(true);
    });
});
