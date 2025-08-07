
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    {/* Toast notifications */}
    <Toaster position="top-right" reverseOrder={false} />
    {/* Main App component (ensure App only renders static content or content not requiring API data) */}
    <App />
  </>
);
