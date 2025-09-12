import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RefundManagement from './RefundManagement';
import * as merchantService from '../../services/merchantService';

// external dependencies mock

// jwt-decode mock
vi.mock('jwt-decode', () => ({
    jwtDecode: () => ({ point_of_sale_id: 'mock-pos-id' }),
}));

// authStore mock
vi.mock('../../store/authStore', () => ({
    authStore: {
        getState: () => ({ token: 'mock-jwt-token' }),
    },
}));

// merchantService mock
vi.mock('../../services/merchantService');

// i18next mock
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// children components mock
vi.mock('../../components/DataTable/DataTable', () => ({
    default: ({ rows, columns, loading }: { rows: any[], columns: any[], loading: boolean }) => (
        <div data-testid="data-table">
            {loading && <span>Loading...</span>}
            {rows.map(row => (
                <div key={row.fiscalCode}>{columns[2].renderCell ? columns[2].renderCell(row) : row.fiscalCode}</div>
            ))}
        </div>
    ),
}));

vi.mock('../../components/FiltersForm/FiltersForm', () => ({
    default: ({ formik, onFiltersApplied, children }: any) => (
        <form data-testid="filters-form" onSubmit={(e) => { e.preventDefault(); onFiltersApplied(formik.values); }}>
            {children}
            <button type="submit">Applica Filtri</button>
        </form>
    ),
}));

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
    TitleBox: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock('../../components/errorAlert/ErrorAlert', () => ({
    default: ({ message }: { message: string }) => <div data-testid="error-alert">{message}</div>,
}));


// test suite
describe('RefundManagement', () => {
    const getProcessedTransactionsMock = vi.spyOn(merchantService, 'getProcessedTransactions');

    const mockTransactions: any = {
        content: [
            { fiscalCode: 'AAAAAA00A00A000A', trxDate: new Date().toISOString() },
            { fiscalCode: 'BBBBBB00B00B000B', trxDate: new Date().toISOString() },
        ],
        pageNo: 0,
        pageSize: 10,
        totalElements: 2,
    };

    beforeEach(() => {
        // default mock implementation
        getProcessedTransactionsMock.mockResolvedValue(mockTransactions);
    });

    afterEach(() => {
        // clean up
        vi.clearAllMocks();
    });

    it('should fetch transactions and display them on first render', async () => {
        render(<RefundManagement />);

        // Verify that the title is rendered
        expect(screen.getByText('pages.refundManagement.title')).toBeInTheDocument();

        // Wait for the API call to resolve and data to be displayed
        await waitFor(() => {
            expect(getProcessedTransactionsMock).toHaveBeenCalledTimes(1);
            expect(getProcessedTransactionsMock).toHaveBeenCalledWith(
                "688a12d87415622f166697a0", // initiativeId hardcoded
                'mock-pos-id', // point_of_sale_id dal mock di jwtDecode
                expect.any(Object)
            );
        });

        // Verify that the mocked data is present in the document
        expect(screen.getByText('AAAAAA00A00A000A')).toBeInTheDocument();
        expect(screen.getByText('BBBBBB00B00B000B')).toBeInTheDocument();
    });

    it('should show an error message if the API call fails', async () => {
        // override the mock for this specific test
        getProcessedTransactionsMock.mockRejectedValue(new Error('API Error'));

        render(<RefundManagement />);

        // Wait for the error alert to appear in the DOM
        const errorAlert = await screen.findByTestId('error-alert');
        expect(errorAlert).toBeInTheDocument();
        expect(screen.getByText('pages.refundManagement.errorAlert')).toBeInTheDocument();

        // Verify that the data was not rendered
        expect(screen.queryByText('AAAAAA00A00A000A')).not.toBeInTheDocument();
    });

    it('should show a specific message when there are no transactions', async () => {
        // override the mock for this specific test
        getProcessedTransactionsMock.mockResolvedValue({});

        render(<RefundManagement />);

        // Wait for the "no transactions" message to appear
        expect(await screen.findByText('pages.refundManagement.noTransactions')).toBeInTheDocument();
    });

    it('should re-execute the API call with the correct filters when they are applied', async () => {
        const user = userEvent.setup();
        render(<RefundManagement />);
        
        // Wait for the initial loading
        await waitFor(() => expect(getProcessedTransactionsMock).toHaveBeenCalledTimes(1));

        // Simulate typing in the fiscal code input field
        const fiscalCodeInput = screen.getByLabelText('Cerca per codice fiscale');
        await user.type(fiscalCodeInput, 'TESTCF123456789');

        // Simulate clicking the apply filters button (present in our FiltersForm mock)
        const applyButton = screen.getByRole('button', { name: 'Applica Filtri' });
        await user.click(applyButton);

        // Verify that the second API call was made with the filter parameters
        await waitFor(() => {
            expect(getProcessedTransactionsMock).toHaveBeenCalledTimes(2);
            expect(getProcessedTransactionsMock).toHaveBeenLastCalledWith(
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    fiscalCode: 'TESTCF123456789', 
                    page: 0,
                    size: 10
                })
            );
        });
    });

});
