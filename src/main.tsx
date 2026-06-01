import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'

// Initialize theme before React hydration
const savedTheme = (localStorage.getItem('resq-theme') as 'light' | 'dark') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

console.log(' main.tsx: Starting React app');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
