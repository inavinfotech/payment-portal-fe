import React, { useEffect, useState } from "react";
import axios from "axios";
import { Copy, Check } from "lucide-react";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const adminKey = localStorage.getItem("adminKey");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/payments`,
        {
          headers: { "x-admin-key": adminKey },
        },
      );
      setPayments(response.data);
    } catch (error) {
      console.error("Failed to fetch payments", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = async (format) => {
    try {
      const adminKey = localStorage.getItem("adminKey");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/payments/export`,
        {
          params: { format },
          headers: { "x-admin-key": adminKey },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `payments.${format === "excel" ? "xlsx" : format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export payments", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Payment History</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("csv")}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            CSV
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                App
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono flex items-center gap-2">
                  {payment.razorpay_order_id}
                  <button
                    onClick={() => copyToClipboard(payment.razorpay_order_id)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Copy Order ID"
                  >
                    {copiedId === payment.razorpay_order_id ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {payment.razorpay_payment_id ? (
                    <div className="flex items-center gap-2">
                      {payment.razorpay_payment_id}
                      <button
                        onClick={() =>
                          copyToClipboard(payment.razorpay_payment_id)
                        }
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Copy Payment ID"
                      >
                        {copiedId === payment.razorpay_payment_id ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {payment.app_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.currency} {payment.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm relative group overflow-visible">
                  <span
                    className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                    style={{
                      backgroundColor:
                        payment.status === "paid"
                          ? "#10B981" // Green
                          : payment.status === "created"
                            ? "#F59E0B" // Yellow
                            : payment.status === "cancelled"
                              ? "#ff5353ff" // Red (lighter)
                              : payment.status === "unprocessed"
                                ? "#9CA3AF" // Gray
                                : "#ff0000ff", // Red (failed)
                    }}
                  >
                    {payment.status}
                  </span>

                  {(payment.status === "failed" ||
                    payment.status === "cancelled") &&
                    (payment.metadata_info?.failure_reason ||
                      payment.metadata_info?.cancellation_reason) && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <p className="whitespace-normal">
                          {payment.metadata_info.failure_reason ||
                            payment.metadata_info.cancellation_reason}
                        </p>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(payment.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
