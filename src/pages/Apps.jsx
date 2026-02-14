import React, { useEffect, useState } from "react";
import axios from "axios";

import { useToast } from "../context/ToastContext";

const Apps = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [createdApp, setCreatedApp] = useState(null);

  const toast = useToast();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const adminKey = localStorage.getItem("adminKey");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/apps`,
        {
          headers: { "x-admin-key": adminKey },
        },
      );
      setApps(response.data);
    } catch (error) {
      console.error("Failed to fetch apps", error);
      if (error.response?.status === 401) {
        // Optional: Redirect to login or show error
      }
      toast.error("Failed to fetch apps");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = async () => {
    try {
      const adminKey = localStorage.getItem("adminKey");
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/apps`,
        { name: newAppName },
        { headers: { "x-admin-key": adminKey } },
      );
      setCreatedApp(response.data);
      setApps([...apps, response.data]);
      setNewAppName("");
      toast.success("App created successfully");
    } catch (error) {
      console.error("Failed to create app", error);
      toast.error("Failed to create app");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Registered Apps</h2>
        <button
          onClick={() => {
            setShowModal(true);
            setCreatedApp(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create App
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New App</h3>

            {!createdApp ? (
              <>
                <input
                  type="text"
                  placeholder="App Name"
                  className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateApp}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={!newAppName}
                  >
                    Create
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <p className="font-bold text-green-800">App Created!</p>
                  <p className="text-sm text-red-600 font-bold mt-2">
                    Copy these credentials now. You won't see the secret again.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    App ID
                  </label>
                  <div className="flex gap-2">
                    <code className="block w-full bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                      {createdApp.id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(createdApp.id)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <code className="block w-full bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                      {createdApp.api_key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(createdApp.api_key)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    API Secret
                  </label>
                  <div className="flex gap-2">
                    <code className="block w-full bg-gray-100 p-2 rounded text-sm break-all">
                      {createdApp.api_secret}
                    </code>
                    <button
                      onClick={() => copyToClipboard(createdApp.api_secret)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                API Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apps.map((app) => (
              <tr key={app.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {app.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {app.api_key}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">
                  <button onClick={() => copyToClipboard(app.api_key)}>
                    Copy Key
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

export default Apps;
