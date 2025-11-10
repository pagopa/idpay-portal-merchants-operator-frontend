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
import PrivacyPolicy from "./pages/privacyPolicy/PrivacyPolicy.tsx";
import TermsOfService from "./pages/tos/TOS.tsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
        <Route path={ROUTES.TOS} element={<TermsOfService />} />

        {/* Protected routes */}
        <Route path={ROUTES.HOME} element={
          <ProtectedRoute><Layout><Navigate to={ROUTES.BUY_MANAGEMENT} /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTES.ACCEPT_DISCOUNT} element={
          <ProtectedRoute><Layout><AcceptDiscount /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTES.ACCEPT_DISCOUNT_SUMMARY} element={
          <ProtectedRoute><Layout><SummaryAcceptDiscount /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTES.REFUNDS_MANAGEMENT} element={
          <ProtectedRoute><Layout><RefundManagement /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTES.BUY_MANAGEMENT} element={
          <ProtectedRoute><Layout><PurchaseManagement /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTES.PROFILE} element={
          <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTES.PRODUCTS} element={
          <ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTES.REVERSE} element={
          <ProtectedRoute><Layout><Reverse /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTES.REFUND} element={
          <ProtectedRoute><Layout><Refund /></Layout></ProtectedRoute>
        } />
        <Route path="*" element={
          <ProtectedRoute><Layout><Navigate to={ROUTES.BUY_MANAGEMENT} replace /></Layout></ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App