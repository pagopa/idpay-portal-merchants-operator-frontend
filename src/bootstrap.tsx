import './index.css';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import App from './App';
// import { Provider } from 'react-redux';
import { AuthProvider } from "./contexts/AuthContext";
import './locale';
// import { store } from './redux/store';


ReactDOM.render(
  <AuthProvider>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </AuthProvider>,
  document.getElementById('root'));