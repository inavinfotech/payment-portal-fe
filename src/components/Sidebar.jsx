import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  AppWindow,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";

const Sidebar = () => {
  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { to: "/apps", label: "Apps", icon: <AppWindow size={20} /> },
    { to: "/payments", label: "Payments", icon: <CreditCard size={20} /> },
    { to: "/settings", label: "Settings", icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <div className="flex items-center gap-3 mb-8">
        <img
          src="/logo.webp"
          alt="SVARP Logo"
          className="w-10 h-10 object-contain animate-spin-y"
        />
        <h1 className="text-lg font-bold leading-tight">
          CENTRAL PAYMENT PORTAL
        </h1>
      </div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive ? "bg-blue-600" : "hover:bg-gray-800"
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-gray-800">
        <button
          onClick={() => {
            localStorage.removeItem("adminKey");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 p-3 rounded-lg w-full hover:bg-red-900 text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
