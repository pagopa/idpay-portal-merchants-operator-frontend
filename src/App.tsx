import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css'
import Layout from './components/Layout/Layout';
import AcceptDiscount from "./pages/AcceptDiscount/AcceptDiscount.tsx";
import routes from './routes.ts';
import Products from './pages/Products/Products.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

function App() {

  return (
    <div className="min-h-screen bg-gray-100">

      <Routes>
        <Route element={<ProtectedRoute children={''} />}>
          <Route path="/" element={<Layout><Products /></Layout>} />
          <Route path={routes.ACCEPT_DISCOUNT} element={<Layout><AcceptDiscount /></Layout>} />
          {/* TODO: creare pagine sotto pages e poi i componenti sotto components. vedi products per esempio */}
          <Route path={routes.PRODUCTS} element={<Layout><Products /></Layout>} />
          <Route path={routes.PROFILE} element={<Layout><Products /></Layout>} />
          <Route path={routes.BUY_MANAGEMENT} element={<Layout><Products /></Layout>} />
          <Route path={routes.REFUNDS_MANAGEMENT} element={<Layout><Products /></Layout>} />       
        </Route>
        <Route path="*" element={<Navigate to={routes.HOME} />} />
      </Routes>
    </div>

  )
}

export default App

