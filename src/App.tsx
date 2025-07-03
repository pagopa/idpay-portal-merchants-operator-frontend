import './App.css'

import { useAuth } from 'react-oidc-context';

// //components
import Layout from './components/Layout/Layout';


function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>Caricamento sessione...</div>;
  }

  if (!auth.isAuthenticated) {
    auth.signinRedirect(); 
    return <div>Reindirizzamento al login...</div>;
  }

  return (
    <Layout>
    </Layout>

  )
}

export default App

