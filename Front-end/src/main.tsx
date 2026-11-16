import "@/styles/global.css";

import { createRoot } from "react-dom/client";
import { Routes, BrowserRouter, Route } from "react-router";
import LoginPage from "@/pages/Login";
import HomePage from "@/pages/homepage";
import ForgotPasswordPage from "@/pages/forgotpass";
import BooksPage from "@/pages/books";
import ResetPasswordPage from "@/pages/resetpass";
import RegisterPage from "@/pages/Register";
import AdminPage from "@/pages/Admin";
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/homepage" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  </BrowserRouter>
);