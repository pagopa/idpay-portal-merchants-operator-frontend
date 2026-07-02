import './App.css';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Route, Routes, Navigate } from 'react-router-dom';
import AcceptDiscount from './pages/acceptDiscount/AcceptDiscount.tsx';
import SummaryAcceptDiscount from './pages/summaryAcceptDiscount/SummaryAcceptDiscount.tsx';
import ROUTES from './routes.ts';
import RefundManagement from './pages/refundManagement/RefundManagement.tsx';
import PurchaseManagement from './pages/purchaseManagement/PurchaseManagement.tsx';
import Profile from './pages/profile/Profile.tsx';
import Products from './pages/products/Products.tsx';
import Reverse from './pages/reverse/Reverse.tsx';
import Refund from './pages/refund/Refund.tsx';
import PrivacyPolicy from './pages/privacyPolicy/PrivacyPolicy.tsx';
import TermsOfService from './pages/tos/TOS.tsx';
import ModifyDocument from './pages/modifyDocument/ModifyDocument.tsx';
import { getInitiativesList } from './services/merchantService.ts';
import { setInitiativesList } from './redux/slices/initiativesSlice.ts';
import { useAppDispatch } from './redux/hooks.ts';
import { buildNamespaceKey } from './utils/buildNamespaceKey.ts';
import { initI18n } from './locale/index.ts';
import { useEffect, useState } from 'react';
import { InitiativesList } from './pages/initiativesList/InitiativesList.tsx';
import { useAuth } from './contexts/AuthContext.tsx';

function App() {
  const { isAuthenticated, token } = useAuth()
  const [isLoaded, setIsLoaded] = useState(false)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return; 
    }
    const initializeApp = async () => {
      try {
        const data = await getInitiativesList();
        dispatch(setInitiativesList(data.initiatives));
        const namespaces = data.initiatives.map(
          ({ initiativeName, startDate }) => buildNamespaceKey(initiativeName, startDate)
        );
        await initI18n(namespaces);
      } finally {
        setIsLoaded(true)
      }
    }
    initializeApp();
  }, [dispatch, isAuthenticated, token])

  if (!isLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento iniziative...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
        <Route path={ROUTES.TOS} element={<TermsOfService />} />

        {/* Protected routes */}
        <Route
          path={ROUTES.HOME}
          element={
            <ProtectedRoute>
              <Layout>
                <Navigate to={ROUTES.INITIATIVES_LIST} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.INITIATIVES_LIST}
          element={
            <ProtectedRoute>
              <Layout>
                <InitiativesList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ACCEPT_DISCOUNT}
          element={
            <ProtectedRoute>
              <Layout>
                <AcceptDiscount />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ACCEPT_DISCOUNT_SUMMARY}
          element={
            <ProtectedRoute>
              <Layout>
                <SummaryAcceptDiscount />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REFUNDS_MANAGEMENT}
          element={
            <ProtectedRoute>
              <Layout>
                <RefundManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.BUY_MANAGEMENT}
          element={
            <ProtectedRoute>
              <Layout>
                <PurchaseManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PRODUCTS}
          element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REVERSE}
          element={
            <ProtectedRoute>
              <Layout>
                <Reverse />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REFUND}
          element={
            <ProtectedRoute>
              <Layout>
                <Refund />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MODIFY_DOCUMENT}
          element={
            <ProtectedRoute>
              <Layout>
                <ModifyDocument />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Layout>
                <Navigate to={ROUTES.INITIATIVES_LIST} replace />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
