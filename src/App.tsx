import './App.css'
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Route, Routes } from "react-router-dom";
import AcceptDiscount from "./pages/acceptDiscount/AcceptDiscount.tsx";
import SummaryAcceptDiscount from "./pages/summaryAcceptDiscount/SummaryAcceptDiscount.tsx";

function App() {

  return (
    <div className="min-h-screen bg-gray-100">
      <ProtectedRoute>
        <Layout>
          <Routes>
            <Route path="/" element={<AcceptDiscount />} />
            <Route path="/riepilogo-accetta-buono-sconto" element={<SummaryAcceptDiscount />} />
          </Routes>
        </Layout>
      </ProtectedRoute>
    </div>

  )
}

export default App

