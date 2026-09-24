import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Route guard that only allows SUPER_ADMIN role to pass.
 * Any other role (or missing role) is redirected to /dashboard.
 */
const SuperAdminRoute = ({ children }) => {
  const storedUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const role = (storedUser.role || "").toUpperCase().replace(" ", "_");

  if (role !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default SuperAdminRoute;
