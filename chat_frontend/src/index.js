import React from 'react';
import './index.css';
import App from './App';
import { Provider } from "react-redux"
import ReactDOM from 'react-dom/client';
import { store } from './redux/store';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SnackbarProvider } from './context/SnackBarContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <SocketProvider>
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </SocketProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
