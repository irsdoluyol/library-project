import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./styles/index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
