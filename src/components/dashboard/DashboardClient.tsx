"use client";
import React from "react";

import DashboardHeader from "./DashboardHeader";

import AdminDashboardTabs from "./AdminDashboardTabs";
import UserDashboardTabs from "./UserDashboardTabs";
import CompanyDashboardTabs from "./CompanyDashboardTabs";

type DashboardClientProps = {
  role: string;
  username?: string;
};

const DashboardClient: React.FC<DashboardClientProps> = ({ role, username }) => {
  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/auth/login";
  };

  return (
    <div>
      <DashboardHeader username={username || "Usuario"} onLogout={handleLogout} />
      {role === "ADMINISTRADOR" && <AdminDashboardTabs />}
      {role === "USUARIO" && <UserDashboardTabs />}
      {role === "EMPRESA" && <CompanyDashboardTabs />}
    </div>
  );
};

export default DashboardClient;
