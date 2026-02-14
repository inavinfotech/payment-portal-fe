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

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const adminKey = localStorage.getItem("adminKey");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/admin/dashboard-summary`,
          {
            headers: { "x-admin-key": adminKey },
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

  if (loading) return <div>Loading...</div>;

  const COLORS = {
    failed: "#ff0000ff", // Red
    cancelled: "#ff5353ff", // Red
    unprocessed: "#9CA3AF", // Gray
    created: "#F59E0B", // Yellow
    paid: "#10B981", // Green
  };

  const formattedStatusData =
    summary?.payment_status_counts?.map((item) => ({
      name: item.status,
      value: item.count,
    })) || [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Summary</h2>

      {/* Top Section: Summary Cards + Pie Chart */}

      {/* Top Section: Summary Cards + Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Column: Stats */}
        <div className="flex flex-col gap-6">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center flex-1">
            <h3 className="text-gray-500 text-sm uppercase">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">
              ₹{summary?.total_revenue || 0}
            </p>
          </div>

          {/* Total Payments */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center flex-1">
            <h3 className="text-gray-500 text-sm uppercase">Total Payments</h3>
            <p className="text-3xl font-bold text-gray-900">
              {summary?.total_payments || 0}
            </p>
          </div>
        </div>

        {/* Right Column: Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6 h-[300px] flex flex-col">
          <h3 className="text-gray-500 text-sm uppercase mb-4 text-center">
            Payment Status
          </h3>
          <div className="flex-1 flex items-center justify-center">
            {formattedStatusData.length > 0 ? (
              <div style={{ width: "100%", height: "100%" }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={formattedStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {formattedStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.name] || "#8884d8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500">No payment data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Revenue by App Table (Full Width) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Revenue by App</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  App ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary?.revenue_by_app.map((item) => (
                <tr key={item.app_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.app_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{item.total}
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

export default Dashboard;
