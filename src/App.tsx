import './App.css'
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
// import {Switch} from "@mui/material";
// import {Route} from "react-router-dom";
import AcceptDiscount from "./pages/AcceptDiscount/AcceptDiscount.tsx";

function App() {

  return (
    <div className="min-h-screen bg-gray-100">
      <ProtectedRoute>
            <Layout>
                {/*<Switch>*/}
                {/*    <Route path={"/accetta-buono-sconto"}>*/}
                {/*        <AcceptDiscount />*/}
                {/*        </Route>*/}
                {/*    <Route path={"/accetta-buono"}>*/}
                {/*        <AcceptDiscount />*/}
                {/*    </Route>*/}
                {/*</Switch>*/}
                <AcceptDiscount />
            </Layout>
      </ProtectedRoute>
    </div>

  )
}

export default App

