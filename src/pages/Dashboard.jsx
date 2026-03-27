import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { IndianRupee, CreditCard, Activity } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const adminToken = localStorage.getItem("adminToken");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/admin/dashboard-summary`,
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          },
        );
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  const COLORS = {
    failed: "#ef4444", // Red
    cancelled: "#f87171", // Lighter Red
    unprocessed: "#94a3b8", // Slate
    created: "#f59e0b", // Amber
    paid: "#10b981", // Emerald
  };

  const formattedStatusData =
    summary?.payment_status_counts?.map((item) => ({
      name: item.status,
      value: item.count,
    })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-gray-500 mt-2 font-medium">Real-time payment metrics and analytics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
              <IndianRupee size={24} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">
                ₹{summary?.total_revenue?.toLocaleString('en-IN') || 0}
              </p>
            </div>
          </div>

          {/* Total Payments */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Payments</h3>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.total_payments || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Pie Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-800 font-bold flex items-center gap-2">
              <Activity size={18} className="text-primary-600" />
              Payment Status Distribution
            </h3>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {formattedStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {formattedStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name] || "#3b82f6"}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 font-medium italic">No payment transactions recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue by App Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Revenue Contribution by Application</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Application Identifier
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Generated Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {summary?.revenue_by_app?.length > 0 ? (
                summary.revenue_by_app.map((item) => (
                  <tr key={item.app_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                      {item.app_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-700 text-right">
                      ₹{item.total?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-gray-400 italic font-medium">
                    No application revenue data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
