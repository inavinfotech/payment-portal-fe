import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, CreditCard, AppWindow, LogOut } from "lucide-react";

const Sidebar = () => {
  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { to: "/apps", label: "Apps", icon: <AppWindow size={20} /> },
    { to: "/payments", label: "Payments", icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-xl font-bold mb-8">SVARP CENTRAL PAYMENT PORTAL</h1>
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
