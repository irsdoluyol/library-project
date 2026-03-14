import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./styles/index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <FavoritesProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              className: "toast-custom",
              success: { className: "toast-custom toast-custom-success" },
              error: { className: "toast-custom toast-custom-error" },
            }}
          />
        </FavoritesProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
