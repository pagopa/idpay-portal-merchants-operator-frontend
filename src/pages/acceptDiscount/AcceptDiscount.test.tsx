import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AcceptDiscount from './AcceptDiscount';
import {vitest} from 'vitest';

const mockedT = (key: string) => {
    const translations: Record<string, string> = {
        'pages.acceptDiscount.search': 'Cerca',
        'pages.acceptDiscount.expenditureAmount': 'Importo spesa',
        'pages.acceptDiscount.discountCode': 'Codice sconto',
        'commons.continueBtn': 'Continua',
        'pages.acceptDiscount.requiredField': 'Campo obbligatorio'
    };
    return translations[key] || key;
};

vitest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockedT,
        i18n: {
            changeLanguage: vitest.fn()
        }
    }),
}));


describe('AcceptDiscount', () => {

    test('renders without crashing', () => {
        render(
            <MemoryRouter>
                <AcceptDiscount />
            </MemoryRouter>
        );
    });

    test('renders all input fields', () => {
        render(
            <MemoryRouter>
                <AcceptDiscount />
            </MemoryRouter>
        );
        expect(screen.getByLabelText('Cerca')).toBeInTheDocument();
        expect(screen.getByLabelText('Importo spesa')).toBeInTheDocument();
        expect(screen.getByLabelText('Codice sconto')).toBeInTheDocument();
    });


    test('show validation errors when fields are empty and user clicks continue', () => {
        render(
            <MemoryRouter>
                <AcceptDiscount />
            </MemoryRouter>
        );
        const continueBtn = screen.getByRole('button', { name: /Continua/i });
        fireEvent.click(continueBtn);

        expect(screen.getAllByText(/Campo obbligatorio/i).length).toBe(3);
    });

});

