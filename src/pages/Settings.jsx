import React, { useEffect, useState } from "react";
import axios from "axios";
import { Save, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [apps, setApps] = useState([]);
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
      const adminKey = localStorage.getItem("adminKey");
      const [settingsRes, appsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/settings`, {
          headers: { "x-admin-key": adminKey },
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/apps`, {
          headers: { "x-admin-key": adminKey },
        }),
      ]);

      setSettings(settingsRes.data);
      setApps(appsRes.data);

      // Initialize domain edits
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
          ? "⚠️ CRITICAL WARNING: Disabling global payments will immediately reject ALL payment requests from ALL apps. Are you absolutely sure?"
          : "Are you sure you want to enable global payment processing? Apps will be able to accept payments again.",
      confirmText:
        newValue === "false"
          ? "Yes, Stop All Payments"
          : "Yes, Enable Payments",
      type: newValue === "false" ? "danger" : "primary",
    });

    if (!isConfirmed) return;

    try {
      const adminKey = localStorage.getItem("adminKey");

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/settings`,
        { global_payment_enabled: newValue },
        { headers: { "x-admin-key": adminKey } },
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
    const message = `${
      currentStatus
        ? "This will prevent the app from processing any new payments."
        : "This will allow the app to process payments again."
    }`;

    const isConfirmed = await confirm({
      title: `${action} App?`,
      message: `Are you sure you want to ${action} the app "${appName}"?\n\n${message}`,
      confirmText: currentStatus ? "Block App" : "Activate App",
      type: currentStatus ? "danger" : "primary",
    });

    if (!isConfirmed) {
      return;
    }

    try {
      const adminKey = localStorage.getItem("adminKey");
      const newStatus = !currentStatus;

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/admin/apps/${appId}/status`,
        { is_active: newStatus },
        { headers: { "x-admin-key": adminKey } },
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
    const message = `${
      currentMode
        ? "This will switch the app to use Test Razorpay credentials."
        : "This will switch the app to use Live Razorpay credentials."
    }`;

    const isConfirmed = await confirm({
      title: `Switch to ${action} Mode?`,
      message: `Are you sure you want to switch the app "${appName}" to ${action} mode?\n\n${message}`,
      confirmText: `Switch to ${action}`,
      type: currentMode ? "primary" : "danger",
    });

    if (!isConfirmed) {
      return;
    }

    try {
      const adminKey = localStorage.getItem("adminKey");
      const newMode = !currentMode;

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/admin/apps/${appId}/mode`,
        { is_live_mode: newMode },
        { headers: { "x-admin-key": adminKey } },
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

  const validateDomains = (domainString) => {
    if (
      !domainString ||
      domainString.trim() === "*" ||
      domainString.trim() === ""
    )
      return true;

    const domains = domainString.split(",").map((d) => d.trim());
    // Simple regex for domain validation (supports localhost, IPs, and standard domains)
    const domainRegex =
      /^(?:\*|[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;

    const invalidDomains = domains.filter((d) => !domainRegex.test(d));

    if (invalidDomains.length > 0) {
      return `Invalid domains found: ${invalidDomains.join(", ")}`;
    }
    return true;
  };

  const handleDomainSave = async (appId) => {
    const domains = domainEdits[appId];
    const validation = validateDomains(domains);

    if (validation !== true) {
      toast.error(validation);
      return;
    }

    const isConfirmed = await confirm({
      title: "Update Allowed Domains?",
      message:
        "Are you sure you want to update the allowed domains for this app? \n\nIncorrect configurations may block legitimate payment requests.",
      confirmText: "Save Changes",
      type: "primary",
    });

    if (!isConfirmed) return;

    setSaveStatus({ ...saveStatus, [appId]: "saving" });
    try {
      const adminKey = localStorage.getItem("adminKey");
      const domains = domainEdits[appId];

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/admin/apps/${appId}/domains`,
        { allowed_domains: domains },
        { headers: { "x-admin-key": adminKey } },
      );

      setApps(
        apps.map((app) =>
          app.id === appId ? { ...app, allowed_domains: domains } : app,
        ),
      );
      setSaveStatus({ ...saveStatus, [appId]: "success" });
      toast.success("Domains updated successfully");

      setTimeout(() => {
        setSaveStatus((prev) => {
          const newState = { ...prev };
          delete newState[appId];
          return newState;
        });
      }, 3000);
    } catch (error) {
      console.error("Failed to update domains", error);
      setSaveStatus({ ...saveStatus, [appId]: "error" });
      toast.error("Failed to update domains");
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">System Settings</h2>

      {/* Global Switch */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Global Payment Processing
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              When disabled, no payment requests will be accepted from any app.
            </p>
          </div>
          <div>
            <button
              onClick={handleGlobalToggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.global_payment_enabled === "true"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition transition-transform ${
                  settings.global_payment_enabled === "true"
                    ? "translate-x-7"
                    : "translate-x-1"
                }`}
              />
            </button>
            <span className="ml-3 font-medium text-sm">
              {settings.global_payment_enabled === "true"
                ? "Active"
                : "Stopped"}
            </span>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">App Management</h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                App Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Allowed Domains
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apps.map((app) => (
              <tr key={app.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {app.name}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {app.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() =>
                      handleAppStatusToggle(app.id, app.is_active, app.name)
                    }
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.is_active
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {app.is_active ? "Active" : "Blocked"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() =>
                      handleAppModeToggle(app.id, app.is_live_mode, app.name)
                    }
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.is_live_mode
                        ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {app.is_live_mode ? "LIVE" : "TEST"}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Comma separated domains (e.g. example.com, localhost)"
                    value={domainEdits[app.id] || ""}
                    onChange={(e) =>
                      setDomainEdits({
                        ...domainEdits,
                        [app.id]: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Use * for all domains
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDomainSave(app.id)}
                    disabled={saveStatus[app.id] === "saving"}
                    className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saveStatus[app.id] === "saving" ? (
                      "Saving..."
                    ) : saveStatus[app.id] === "success" ? (
                      <>
                        <CheckCircle size={14} /> Saved
                      </>
                    ) : saveStatus[app.id] === "error" ? (
                      <>
                        <AlertTriangle size={14} /> Failed
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Save
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
