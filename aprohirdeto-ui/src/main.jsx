import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

// Egyszerű "falusi" téma a Material-UI-nak
const theme = createTheme({
  palette: {
    primary: {
      main: '#8b4513', // Barna
    },
    secondary: {
      main: '#228b22', // Zöld
    },
    background: {
      default: '#f5f1e8', // Halvány háttér
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalizálja a CSS-t */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)