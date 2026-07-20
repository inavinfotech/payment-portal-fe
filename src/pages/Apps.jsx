import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Copy, Key, Calendar, ShieldCheck, AlertCircle, Building2, Edit3 } from 'lucide-react';
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";

const API = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem("adminToken");
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const Apps = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppAccountId, setNewAppAccountId] = useState("");
  const [createdApp, setCreatedApp] = useState(null);
  const [razorpayAccounts, setRazorpayAccounts] = useState([]);

  // Edit App state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [editAppName, setEditAppName] = useState("");
  const [editAppAccountId, setEditAppAccountId] = useState("");

  const toast = useToast();

  useEffect(() => {
    fetchApps();
    fetchRazorpayAccounts();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await axios.get(`${API}/admin/apps`, { headers: headers() });
      setApps(response.data);
    } catch (error) {
      console.error("Failed to fetch apps", error);
      toast.error("Failed to fetch apps");
    } finally {
      setLoading(false);
    }
  };

  const fetchRazorpayAccounts = async () => {
    try {
      const res = await axios.get(`${API}/admin/razorpay-accounts`, { headers: headers() });
      setRazorpayAccounts(res.data);
    } catch (err) {
      console.error("Failed to fetch Razorpay accounts", err);
    }
  };

  const handleCreateApp = async () => {
    try {
      const payload = { name: newAppName };
      if (newAppAccountId) payload.razorpay_account_id = newAppAccountId;
      
      const response = await axios.post(`${API}/admin/apps`, payload, { headers: headers() });
      setCreatedApp(response.data);
      // Refetch to get full data with razorpay_account_name
      fetchApps();
      setNewAppName("");
      setNewAppAccountId("");
      toast.success("App created successfully");
    } catch (error) {
      console.error("Failed to create app", error);
      toast.error(error.response?.data?.detail || "Failed to create app");
    }
  };

  const openEdit = (app) => {
    setEditingApp(app);
    setEditAppName(app.name);
    setEditAppAccountId(app.razorpay_account_id || "");
    setShowEditModal(true);
  };

  const handleUpdateApp = async () => {
    try {
      const payload = {
        name: editAppName,
        razorpay_account_id: editAppAccountId || null
      };
      await axios.put(`${API}/admin/apps/${editingApp.id}`, payload, { headers: headers() });
      toast.success("Application updated successfully");
      setShowEditModal(false);
      fetchApps();
    } catch (error) {
      console.error("Failed to update app", error);
      toast.error(error.response?.data?.detail || "Failed to update app");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Registered Applications</h2>
          <p className="text-gray-500 text-sm mt-1">Manage API credentials and application access.</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setCreatedApp(null);
          }}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Create New App
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Configure New Application</h3>

            {!createdApp ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. My Awesome Store"
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 font-medium"
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                  />
                </div>

                {/* Razorpay Account Select */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Building2 size={16} className="text-gray-400" />
                      Razorpay Account
                    </span>
                  </label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all text-gray-700 font-medium"
                    value={newAppAccountId}
                    onChange={(e) => setNewAppAccountId(e.target.value)}
                  >
                    <option value="">Default Account</option>
                    {razorpayAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} {acc.is_default ? "(Default)" : ""} — {acc.test_key_id}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1.5">Select which Razorpay account this app should use for payments.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateApp}
                    className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                    disabled={!newAppName}
                  >
                    Generate Credentials
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 flex gap-4 items-start">
                  <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-bold text-amber-900">Security Warning!</p>
                    <p className="text-sm text-amber-800 font-medium mt-1 leading-relaxed">
                      Please copy these credentials immediately. For security reasons, the <span className="underline font-bold">API Secret</span> will not be shown again.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Application ID", value: createdApp.id },
                    { label: "Public API Key", value: createdApp.api_key },
                    { label: "Private API Secret", value: createdApp.api_secret, secret: true }
                  ].map((field, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{field.label}</label>
                      <div className="flex gap-3 items-center">
                        <code className={cn(
                          "block w-full text-sm font-mono break-all",
                          field.secret ? "text-red-600 font-bold" : "text-gray-800"
                        )}>
                          {field.value}
                        </code>
                        <button
                          onClick={() => copyToClipboard(field.value)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors shrink-0"
                          title={`Copy ${field.label}`}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/10"
                >
                  I've safely stored the credentials
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Application Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Public Identifier</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Razorpay Account</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Registration Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                        {app.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{app.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100 text-gray-600 font-mono">
                        {app.api_key}
                      </code>
                      <button onClick={() => copyToClipboard(app.api_key)} className="text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      app.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {app.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {app.razorpay_account_name ? (
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-primary-500" />
                        <span className="text-xs font-semibold text-gray-700">{app.razorpay_account_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(app.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openEdit(app)}
                      className="text-gray-500 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-xl transition-colors border border-transparent hover:border-primary-100 flex items-center justify-center cursor-pointer"
                      title="Edit Application"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      onClick={() => copyToClipboard(app.api_secret_hash)}
                      className="text-primary-600 hover:bg-primary-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border border-transparent hover:border-primary-100 cursor-pointer"
                    >
                      Security Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Edit Application</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Awesome Store"
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 font-medium"
                  value={editAppName}
                  onChange={(e) => setEditAppName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    Razorpay Account
                  </span>
                </label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all text-gray-700 font-medium"
                  value={editAppAccountId}
                  onChange={(e) => setEditAppAccountId(e.target.value)}
                >
                  <option value="">Default Account</option>
                  {razorpayAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} {acc.is_default ? "(Default)" : ""} — {acc.test_key_id}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1.5">Select which Razorpay account this app should use for payments.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateApp}
                  className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  disabled={!editAppName}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apps;
