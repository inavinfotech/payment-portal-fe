import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Key,
  Trash2,
  Edit3,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  Building2,
  Star,
  Globe,
  Lock,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import { cn } from "../utils/cn";

const API = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem("adminToken");
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const RazorpayAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState({
    name: "",
    test_key_id: "",
    test_key_secret: "",
    live_key_id: "",
    live_key_secret: "",
  });

  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API}/admin/razorpay-accounts`, {
        headers: headers(),
      });
      setAccounts(res.data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
      toast.error("Failed to load Razorpay accounts");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      test_key_id: "",
      test_key_secret: "",
      live_key_id: "",
      live_key_secret: "",
    });
    setEditingAccount(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (account) => {
    setEditingAccount(account);
    setForm({
      name: account.name,
      test_key_id: account.test_key_id,
      test_key_secret: "",
      live_key_id: account.live_key_id || "",
      live_key_secret: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingAccount) {
        // Build partial update — only send non-empty fields
        const payload = {};
        if (form.name && form.name !== editingAccount.name)
          payload.name = form.name;
        if (form.test_key_id && form.test_key_id !== editingAccount.test_key_id)
          payload.test_key_id = form.test_key_id;
        if (form.test_key_secret) payload.test_key_secret = form.test_key_secret;
        if (form.live_key_id) payload.live_key_id = form.live_key_id;
        if (form.live_key_secret) payload.live_key_secret = form.live_key_secret;

        await axios.put(
          `${API}/admin/razorpay-accounts/${editingAccount.id}`,
          payload,
          { headers: headers() }
        );
        toast.success("Account updated successfully");
      } else {
        await axios.post(`${API}/admin/razorpay-accounts`, form, {
          headers: headers(),
        });
        toast.success("Account created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchAccounts();
    } catch (err) {
      console.error("Failed to save account", err);
      toast.error(err.response?.data?.detail || "Failed to save account");
    }
  };

  const handleDelete = async (account) => {
    const isConfirmed = await confirm({
      title: "Delete Razorpay Account?",
      message: `Are you sure you want to delete "${account.name}"? This cannot be undone.`,
      confirmText: "Delete Account",
      type: "danger",
    });
    if (!isConfirmed) return;

    try {
      await axios.delete(`${API}/admin/razorpay-accounts/${account.id}`, {
        headers: headers(),
      });
      toast.success("Account deleted");
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete account");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Razorpay Accounts
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage multiple Razorpay payment accounts and assign them to your
            apps.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Add Account
        </button>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No Razorpay Accounts
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Add your first Razorpay account to start accepting payments. Your
            existing .env keys will be used as the default.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={cn(
                "bg-white rounded-2xl shadow-sm border overflow-hidden group hover:shadow-md transition-all",
                account.is_default
                  ? "border-primary-200 ring-1 ring-primary-100"
                  : "border-gray-100"
              )}
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        account.is_default
                          ? "bg-primary-100 text-primary-600"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        {account.name}
                        {account.is_default && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold uppercase tracking-wider">
                            <Star size={10} />
                            Default
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {account.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  {/* We removed the action icons from the top-right corner to make them prominent buttons at the bottom */}
                </div>

                {/* Key Details */}
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Key size={12} className="text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Test Key
                      </span>
                    </div>
                    <code className="text-xs font-mono text-gray-700">
                      {account.test_key_id}
                    </code>
                  </div>

                  <div
                    className={cn(
                      "rounded-xl p-3 border",
                      account.has_live_keys
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-gray-50 border-gray-100 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {account.has_live_keys ? (
                        <Globe size={12} className="text-emerald-500" />
                      ) : (
                        <Lock size={12} className="text-gray-400" />
                      )}
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          account.has_live_keys
                            ? "text-emerald-600"
                            : "text-gray-400"
                        )}
                      >
                        Live Key
                      </span>
                    </div>
                    <code
                      className={cn(
                        "text-xs font-mono",
                        account.has_live_keys
                          ? "text-emerald-700"
                          : "text-gray-500"
                      )}
                    >
                      {account.has_live_keys
                        ? account.live_key_id
                        : "Not configured"}
                    </code>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 font-medium">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Shield size={14} className="text-gray-400" />
                    <span>{account.app_count} {account.app_count === 1 ? "app" : "apps"} linked</span>
                  </div>
                  <span>
                    {new Date(account.created_at).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => openEdit(account)}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm cursor-pointer"
                >
                  <Edit3 size={14} className="text-gray-500" />
                  Edit Account
                </button>
                {!account.is_default ? (
                  <button
                    onClick={() => handleDelete(account)}
                    className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold flex items-center justify-center transition-all active:scale-98 cursor-pointer"
                    title="Delete Account"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-3 bg-gray-100 text-gray-300 border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center cursor-not-allowed"
                    title="Default account cannot be deleted"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-3xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingAccount
                  ? "Update Razorpay Account"
                  : "Add Razorpay Account"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. SVARP Main Account"
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 font-medium"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Keys Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Test Keys Section */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Key size={16} className="text-slate-500" />
                    <span className="text-sm font-bold text-slate-700">
                      Test Mode Keys
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Key ID
                    </label>
                    <input
                      type="text"
                      placeholder="rzp_test_..."
                      className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all placeholder:text-gray-400 font-mono"
                      value={form.test_key_id}
                      onChange={(e) =>
                        setForm({ ...form, test_key_id: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Key Secret
                    </label>
                    <input
                      type="password"
                      placeholder={
                        editingAccount
                          ? "Leave blank to keep current"
                          : "Enter key secret"
                      }
                      className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all placeholder:text-gray-400 font-mono"
                      value={form.test_key_secret}
                      onChange={(e) =>
                        setForm({ ...form, test_key_secret: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Live Keys Section */}
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">
                      Live Mode Keys
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      (Optional)
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Key ID
                    </label>
                    <input
                      type="text"
                      placeholder="rzp_live_..."
                      className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-gray-400 font-mono"
                      value={form.live_key_id}
                      onChange={(e) =>
                        setForm({ ...form, live_key_id: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Key Secret
                    </label>
                    <input
                      type="password"
                      placeholder={
                        editingAccount
                          ? "Leave blank to keep current"
                          : "Enter live key secret"
                      }
                      className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-gray-400 font-mono"
                      value={form.live_key_secret}
                      onChange={(e) =>
                        setForm({ ...form, live_key_secret: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {editingAccount && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3 items-start">
                  <AlertCircle
                    className="text-amber-600 shrink-0 mt-0.5"
                    size={16}
                  />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Leave secret fields blank to keep the existing secrets.
                    Filling them in will overwrite the current values.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    !form.name ||
                    !form.test_key_id ||
                    (!editingAccount && !form.test_key_secret)
                  }
                  className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {editingAccount ? "Update Account" : "Create Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RazorpayAccounts;
