import React from "react";
import AdminDashboardTabs from "./AdminDashboardTabs";
import UserDashboardTabs from "./UserDashboardTabs";
import CompanyDashboardTabs from "./CompanyDashboardTabs";

interface DashboardMainProps {
  role: string;
}

const DashboardMain: React.FC<DashboardMainProps> = ({ role }) => {
  return (
    <div>
      {role === "ADMINISTRADOR" && <AdminDashboardTabs />}
      {role === "USUARIO" && <UserDashboardTabs />}
      {role === "EMPRESA" && <CompanyDashboardTabs />}
    </div>
  );
};

export default DashboardMain;
