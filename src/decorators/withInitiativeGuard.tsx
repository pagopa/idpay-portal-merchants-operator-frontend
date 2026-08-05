import React, { useEffect, useState } from 'react';
import ROUTES from '../routes';
import { useAppSelector } from '../redux/hooks';
import { currentInitiativeSelector, initiativesListSelector } from '../redux/slices/initiativesSlice';
import { matchPath, Navigate, useLocation, useParams } from 'react-router-dom';
import { useScopedTranslation } from '../hooks/useScopedTranslation';
import { useActionPermission } from '../hooks/useActionPermission';

type Props = {
    children: React.ReactNode;
};
const WithInitiativeGuard: React.FC<Props> = ({ children }) => {
    const [isValidRoute, setIsValidRoute] = useState<boolean>(true);
    const location = useLocation()
    const { initiativeId } = useParams()
    const { config } = useScopedTranslation()
    const forbiddenRoutes = config<Array<string>>('commons.permissions.closedRoutes')
    const initiatives = useAppSelector(initiativesListSelector);
    const selectedInitiative = useAppSelector((state) => currentInitiativeSelector(state, initiativeId));
    const { getPermission } = useActionPermission()
    const isActionPermitted = getPermission('commons.permissions.initiativeStatus', selectedInitiative?.status)
    

    const match = (paths) => paths.find((path) => matchPath({ path }, location.pathname))

    const isMatched = match(forbiddenRoutes.map((route) => ROUTES?.[route]));

    useEffect(() => {
        if ((initiativeId && (!selectedInitiative)) || (!isActionPermitted && isMatched)) {
            setIsValidRoute(false)
        }
    }, [initiativeId, initiatives.length, isActionPermitted, isMatched, selectedInitiative]);

    if (!isValidRoute) {
        return (<Navigate to={ROUTES.INITIATIVES_LIST} replace />);
    }

    return <React.Fragment key={initiativeId}>{children}</React.Fragment>;
};

export default WithInitiativeGuard;
