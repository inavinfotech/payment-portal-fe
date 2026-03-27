import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard,
  AppWindow,
  Settings, 
  LogOut, 
  Layers
} from 'lucide-react';
import { cn } from '../utils/cn';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
      isActive 
        ? "bg-primary-600 text-white shadow-lg" 
        : "text-gray-400 hover:text-white hover:bg-sidebar-hover"
    )}
  >
    <Icon size={20} />
    <span>{label}</span>
  </NavLink>
);

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const userEmail = "admin@svarp.com"; // Placeholder or from localStorage if available
  
  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate('/login');
  };
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-auto bg-sidebar text-white flex flex-col shrink-0 border-r border-gray-800 shadow-2xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg">
            <Layers className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight uppercase"> Central Payment</h1>
            <p className="text-xs text-primary-400 font-semibold tracking-widest uppercase opacity-75">Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/apps" icon={AppWindow} label="Apps" />
          <SidebarItem to="/payments" icon={CreditCard} label="Payments" />
          <SidebarItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 mt-auto border-t border-gray-800 bg-black/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Payment Management System</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 leading-none">Admin</p>
              <p className="text-xs text-gray-500 font-medium mt-1">{userEmail}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
              A
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 bg-[#F9FAFB] custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Layout;
