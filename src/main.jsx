import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from '../app/App.jsx';
import { ErrorBoundary } from '../app/error-boundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
