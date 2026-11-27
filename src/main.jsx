import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext'
import './layout.css';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter><CartProvider><App /></CartProvider></BrowserRouter>
  </StrictMode>,
)
