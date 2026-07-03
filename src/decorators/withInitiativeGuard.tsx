import React, { useEffect, useState } from 'react';
import ROUTES from '../routes';
import { useAppSelector } from '../redux/hooks';
import { currentInitiativeSelector, initiativesListSelector } from '../redux/slices/initiativesSlice';
import { Navigate, useParams } from 'react-router-dom';

type Props = {
    children: React.ReactNode;
};
const WithInitiativeGuard: React.FC<Props> = ({ children }) => {
    const [isValidRoute, setIsValidRoute] = useState<boolean>(true);
    const { initiativeId } = useParams()
    const initiatives = useAppSelector(initiativesListSelector);
    const selectedInitiative = useAppSelector((state) => currentInitiativeSelector(state, initiativeId));

    useEffect(() => {
        if (initiativeId && (!selectedInitiative || !(initiatives.length - 1))) {
            setIsValidRoute(false)
        }
    }, [initiativeId, initiatives.length, selectedInitiative]);

    if (!isValidRoute) {
        return (<Navigate to={ROUTES.INITIATIVES_LIST} replace />);
    }

    return <React.Fragment key={initiativeId}>{children}</React.Fragment>;
};

export default WithInitiativeGuard;
