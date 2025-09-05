import './App.css'
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Route, Routes } from "react-router-dom";
import AcceptDiscount from "./pages/acceptDiscount/AcceptDiscount.tsx";
import SummaryAcceptDiscount from "./pages/summaryAcceptDiscount/SummaryAcceptDiscount.tsx";
import ROUTES from './routes.ts';
import PurchasingManagement from "./pages/purchasingManagement/PurchasingManagement.tsx";

function App() {

  return (
    <div className="min-h-screen bg-gray-100">
      <ProtectedRoute>
        <Layout>
          <Routes>
            <Route path={ROUTES.HOME} element={<PurchasingManagement />} />
            <Route path={ROUTES.ACCEPT_DISCOUNT} element={<AcceptDiscount />} />
            <Route path={ROUTES.ACCEPT_DISCOUNT_SUMMARY} element={<SummaryAcceptDiscount />} />
            <Route path={ROUTES.BUY_MANAGEMENT} element={<PurchasingManagement />} />
          </Routes>
        </Layout>
      </ProtectedRoute>
    </div>

  )
}

export default App

