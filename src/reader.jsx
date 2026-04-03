import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ReaderPage from './components/ReaderPage';
import theme from './theme';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('reader-root');
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ReaderPage />
        </ThemeProvider>
      </React.StrictMode>
    );
  }
});
