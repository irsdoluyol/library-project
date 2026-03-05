import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import CatalogPage from "./pages/CatalogPage.jsx";
import MyBooksPage from "./pages/MyBooksPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<CatalogPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/my-books" element={<MyBooksPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
