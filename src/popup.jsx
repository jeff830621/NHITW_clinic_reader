import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import PopupApp from "./components/PopupApp";

const theme = createTheme({
  palette: { primary: { main: "#1976d2" } },
  typography: { fontSize: 13 },
});

document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("popup-root");
  if (!rootElement) return;
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PopupApp />
      </ThemeProvider>
    </React.StrictMode>
  );
});
