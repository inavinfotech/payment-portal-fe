import React, { useEffect, useState } from "react";
import axios from "axios";
import { Save, AlertTriangle, CheckCircle, XCircle, Shield, Globe, Cpu, Settings as SettingsIcon, Check, Building2 } from "lucide-react";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";

const API = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem("adminToken");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [apps, setApps] = useState([]);
  const [razorpayAccounts, setRazorpayAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainEdits, setDomainEdits] = useState({}); // { appId: "domain1, domain2" }
  const [saveStatus, setSaveStatus] = useState({}); // { appId: "saving" | "success" | "error" }

  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const adminToken = getToken();
      const [settingsRes, appsRes, accountsRes] = await Promise.all([
        axios.get(`${API}/admin/settings`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        axios.get(`${API}/admin/apps`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        axios.get(`${API}/admin/razorpay-accounts`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ]);

      setSettings(settingsRes.data);
      setApps(appsRes.data);
      setRazorpayAccounts(accountsRes.data);

      const initialDomains = {};
      appsRes.data.forEach((app) => {
        initialDomains[app.id] = app.allowed_domains || "*";
      });
      setDomainEdits(initialDomains);
    } catch (error) {
      console.error("Failed to fetch settings data", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalToggle = async () => {
    const newValue =
      settings.global_payment_enabled === "true" ? "false" : "true";
    const action = newValue === "true" ? "Enable" : "Disable";

    const isConfirmed = await confirm({
      title: `${action} Global Payments?`,
      message:
        newValue === "false"
          ? "⚠️ CRITICAL WARNING: Disabling global payments will immediately reject ALL payment requests from ALL apps."
          : "Are you sure you want to enable global payment processing?",
      confirmText:
        newValue === "false"
          ? "Yes, Stop All Payments"
          : "Yes, Enable Payments",
      type: newValue === "false" ? "danger" : "primary",
    });

    if (!isConfirmed) return;

    try {
      const adminToken = getToken();

      await axios.post(
        `${API}/admin/settings`,
        { global_payment_enabled: newValue },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      setSettings({ ...settings, global_payment_enabled: newValue });
      toast.success(
        `Global payment processing ${newValue === "true" ? "enabled" : "disabled"}`,
      );
    } catch (error) {
      console.error("Failed to update global setting", error);
      toast.error("Failed to update setting");
    }
  };

  const handleAppStatusToggle = async (appId, currentStatus, appName) => {
    const action = currentStatus ? "BLOCK" : "ACTIVATE";
    const isConfirmed = await confirm({
      title: `${action} App?`,
      message: `Are you sure you want to ${action} "${appName}"?`,
      confirmText: currentStatus ? "Block App" : "Activate App",
      type: currentStatus ? "danger" : "primary",
    });

    if (!isConfirmed) return;

    try {
      const adminToken = getToken();
      const newStatus = !currentStatus;

      await axios.put(
        `${API}/admin/apps/${appId}/status`,
        { is_active: newStatus },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      setApps(
        apps.map((app) =>
          app.id === appId ? { ...app, is_active: newStatus } : app,
        ),
      );
      toast.success(`App "${appName}" ${newStatus ? "activated" : "blocked"}`);
    } catch (error) {
      console.error("Failed to update app status", error);
      toast.error("Failed to update app status");
    }
  };

  const handleAppModeToggle = async (appId, currentMode, appName) => {
    const action = currentMode ? "TEST" : "LIVE";
    const isConfirmed = await confirm({
      title: `Switch to ${action} Mode?`,
      message: `Switch "${appName}" to ${action} mode?`,
      confirmText: `Switch to ${action}`,
      type: currentMode ? "primary" : "danger",
    });

    if (!isConfirmed) return;

    try {
      const adminToken = getToken();
      const newMode = !currentMode;

      await axios.put(
        `${API}/admin/apps/${appId}/mode`,
        { is_live_mode: newMode },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      setApps(
        apps.map((app) =>
          app.id === appId ? { ...app, is_live_mode: newMode } : app,
        ),
      );
      toast.success(
        `App "${appName}" switched to ${newMode ? "LIVE" : "TEST"} mode`,
      );
    } catch (error) {
      console.error("Failed to update app mode", error);
      toast.error("Failed to update app mode");
    }
  };

  const handleAccountChange = async (appId, newAccountId) => {
    try {
      const adminToken = getToken();
      const res = await axios.put(
        `${API}/admin/apps/${appId}/razorpay-account`,
        { razorpay_account_id: newAccountId || null },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      setApps(
        apps.map((app) =>
          app.id === appId
            ? {
                ...app,
                razorpay_account_id: res.data.razorpay_account_id,
                razorpay_account_name: res.data.razorpay_account_name,
              }
            : app,
        ),
      );
      toast.success("Razorpay account updated");
    } catch (error) {
      console.error("Failed to update Razorpay account", error);
      toast.error("Failed to update Razorpay account");
    }
  };

  const handleDomainSave = async (appId) => {
    const domains = domainEdits[appId];
    setSaveStatus({ ...saveStatus, [appId]: "saving" });
    try {
      const adminToken = getToken();
      await axios.put(
        `${API}/admin/apps/${appId}/domains`,
        { allowed_domains: domains },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      setApps(
        apps.map((app) =>
          app.id === appId ? { ...app, allowed_domains: domains } : app,
        ),
      );
      setSaveStatus({ ...saveStatus, [appId]: "success" });
      toast.success("Domains updated");
      setTimeout(() => {
        setSaveStatus((prev) => {
          const newState = { ...prev };
          delete newState[appId];
          return newState;
        });
      }, 3000);
    } catch (error) {
      setSaveStatus({ ...saveStatus, [appId]: "error" });
      toast.error("Update failed");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">System Configuration</h2>
        <p className="text-gray-500 mt-2 font-medium">Global governance and application-specific security policies.</p>
      </div>

      {/* Global Setting Card */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <Globe size={120} className="text-primary-600" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                <Shield size={18} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Global Processing Gateway</h3>
            </div>
            <p className="text-gray-500 leading-relaxed font-medium">
              CRITICAL: This master switch controls the entire payment orchestration layer. Disabling this will instantly reject all incoming payment attempts regardless of individual app settings.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <button
              onClick={handleGlobalToggle}
              className={cn(
                "relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4",
                settings.global_payment_enabled === "true"
                  ? "bg-emerald-500 shadow-lg shadow-emerald-500/30 focus:ring-emerald-500/20"
                  : "bg-rose-500 shadow-lg shadow-rose-500/30 focus:ring-rose-500/20"
              )}
            >
              <span
                className={cn(
                  "inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform duration-300",
                  settings.global_payment_enabled === "true" ? "translate-x-8" : "translate-x-1"
                )}
              />
            </button>
            <div className="flex flex-col">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                settings.global_payment_enabled === "true" ? "text-emerald-600" : "text-rose-600"
              )}>Status</span>
              <span className="font-bold text-gray-900">
                {settings.global_payment_enabled === "true" ? "OPERATIONAL" : "SUSPENDED"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* App Management Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                <Cpu size={20} />
             </div>
             <h3 className="text-xl font-bold text-gray-900">Application Governance</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/6">Entity Metadata</th>
                <th className="px-4 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Policy</th>
                <th className="px-4 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Environment</th>
                <th className="px-4 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Razorpay Account</th>
                <th className="px-4 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">CORS White-list</th>
                <th className="px-6 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Governance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 mb-0.5">{app.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{app.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <button
                      onClick={() => handleAppStatusToggle(app.id, app.is_active, app.name)}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                        app.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
                      )}
                    >
                      {app.is_active ? "Enforced" : "Restricted"}
                    </button>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <button
                      onClick={() => handleAppModeToggle(app.id, app.is_live_mode, app.name)}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                        app.is_live_mode
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                          : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                      )}
                    >
                      {app.is_live_mode ? "PROD" : "SANDBOX"}
                    </button>
                  </td>
                  <td className="px-4 py-6">
                    <select
                      className="w-full bg-gray-50 border border-transparent rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer"
                      value={app.razorpay_account_id || ""}
                      onChange={(e) => handleAccountChange(app.id, e.target.value)}
                    >
                      <option value="">— None —</option>
                      {razorpayAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} {acc.is_default ? "⭐" : ""}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-6">
                    <div className="relative group">
                      <input
                        type="text"
                        className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-xs font-medium text-gray-700 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all pr-10"
                        placeholder="Comma separated domains (e.g. example.com)"
                        value={domainEdits[app.id] || ""}
                        onChange={(e) => setDomainEdits({ ...domainEdits, [app.id]: e.target.value })}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                         <Globe size={14} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button
                      onClick={() => handleDomainSave(app.id)}
                      disabled={saveStatus[app.id] === "saving"}
                      className={cn(
                        "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm hover:shadow-md",
                        saveStatus[app.id] === "success" ? "bg-emerald-500 text-white" :
                        saveStatus[app.id] === "error" ? "bg-rose-500 text-white" :
                        "bg-primary-600 text-white hover:bg-primary-700"
                      )}
                    >
                      {saveStatus[app.id] === "saving" ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white" />
                      ) : saveStatus[app.id] === "success" ? (
                        <Check size={14} />
                      ) : saveStatus[app.id] === "error" ? (
                        <AlertTriangle size={14} />
                      ) : (
                        <Save size={14} />
                      )}
                      {saveStatus[app.id] === "success" ? "Success" : 
                       saveStatus[app.id] === "error" ? "Retry" : 
                       saveStatus[app.id] === "saving" ? "Saving" : "Update"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
