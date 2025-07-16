import './App.css'

// //components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <div className="min-h-screen bg-gray-100">
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    </div>

  )
}

export default App

