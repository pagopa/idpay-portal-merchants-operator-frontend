import './App.css'
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Route, Routes, Navigate } from "react-router-dom";
import AcceptDiscount from "./pages/acceptDiscount/AcceptDiscount.tsx";
import SummaryAcceptDiscount from "./pages/summaryAcceptDiscount/SummaryAcceptDiscount.tsx";
import ROUTES from './routes.ts';
import RefundManagement from "./pages/refundManagement/RefundManagement.tsx";
import PurchaseManagement from "./pages/purchaseManagement/PurchaseManagement.tsx";
import Profile from './pages/profile/Profile.tsx';
import Products from "./pages/products/Products.tsx";
import Reverse from "./pages/reverse/Reverse.tsx";
import Refund from "./pages/refund/Refund.tsx";
import TOS from './pages/tos/TOS.tsx';
import PrivacyPolicy from './pages/privacyPolicy/PrivacyPolicy.tsx';

function App() {

  return (
    <div className="min-h-screen bg-gray-100">
      <ProtectedRoute>
        <Layout>
          <Routes>
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.BUY_MANAGEMENT} />} />
            <Route path={ROUTES.ACCEPT_DISCOUNT} element={<AcceptDiscount />} />
            <Route path={ROUTES.ACCEPT_DISCOUNT_SUMMARY} element={<SummaryAcceptDiscount />} />
            <Route path={ROUTES.REFUNDS_MANAGEMENT} element={<RefundManagement />} />
            <Route path={ROUTES.BUY_MANAGEMENT} element={<PurchaseManagement />} />
            <Route path={ROUTES.PROFILE} element={<Profile />} />
            <Route path={ROUTES.PRODUCTS} element={<Products />} />
            <Route path={ROUTES.REVERSE} element={<Reverse />} />
            <Route path={ROUTES.REFUND} element={<Refund />} />
            <Route path={ROUTES.TOS} element={<TOS />}/>
            <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />}/>
          </Routes>
        </Layout>
      </ProtectedRoute>
    </div>

  )
}

export default App

