import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import Login from "./pages/Login.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Goals from "./pages/Goals.jsx";
import CheckIns from "./pages/CheckIns.jsx";
import Reports from "./pages/Reports.jsx";
import Notifications from "./pages/Notifications.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./styles.css";

function RoleHome() {
  const role = localStorage.getItem("alignx-role");
  if (role === "manager") return <Navigate to="/manager" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/employee" replace />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<RoleHome />} />
            <Route path="/employee" element={<ProtectedRoute roles={["employee"]}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/manager" element={<ProtectedRoute roles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/check-ins" element={<CheckIns />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
