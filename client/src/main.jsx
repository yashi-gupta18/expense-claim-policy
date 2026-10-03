import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';
import './styles/layout.css';
import './styles/sidebar.css';
import './styles/dashboard.css';
import './styles/forms.css';
import './styles/tables.css';
import './styles/badges.css';
import './styles/buttons.css';
import './styles/detail.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
