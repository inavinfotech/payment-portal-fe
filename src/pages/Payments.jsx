import React, { useEffect, useState } from "react";
import axios from "axios";
import { Copy, Check, Download, FileText, Table as TableIcon, Calendar, IndianRupee } from "lucide-react";
import { cn } from "../utils/cn";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/payments`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
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
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/payments/export`,
        {
          params: { format },
          headers: { Authorization: `Bearer ${adminToken}` },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `payments_${new Date().toISOString().split('T')[0]}.${format === "excel" ? "xlsx" : format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export payments", error);
    }
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
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Transaction History</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Detailed log of all payment attempts across applications.</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:text-primary-600 hover:border-primary-100 hover:shadow-sm transition-all shadow-sm"
          >
            <FileText size={14} />
            CSV
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:text-primary-600 hover:border-primary-100 hover:shadow-sm transition-all shadow-sm"
          >
            <TableIcon size={14} />
            EXCEL
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 border border-primary-700 rounded-lg text-xs font-bold text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all"
          >
            <Download size={14} />
            REPORT (PDF)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reference IDs</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">App</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        Order
                        <span className="font-mono text-gray-600">{payment.razorpay_order_id}</span>
                        <button
                          onClick={() => copyToClipboard(payment.razorpay_order_id)}
                          className="text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedId === payment.razorpay_order_id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      </div>
                      {payment.razorpay_payment_id && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          Payment
                          <span className="font-mono text-primary-600 bg-primary-50 px-1 rounded">{payment.razorpay_payment_id}</span>
                          <button
                            onClick={() => copyToClipboard(payment.razorpay_payment_id)}
                            className="text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedId === payment.razorpay_payment_id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 rounded-lg bg-gray-100 text-[11px] font-bold text-gray-600 border border-gray-200 shadow-sm">
                      {payment.app_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1 font-bold text-gray-900">
                      <span className="text-xs text-gray-400">{payment.currency}</span>
                      <span className="text-sm">{payment.amount?.toLocaleString('en-IN')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center relative group-hover:overflow-visible overflow-hidden">
                    <span
                      className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm",
                        payment.status === "paid" ? "bg-emerald-500 text-white" :
                        payment.status === "created" ? "bg-amber-500 text-white" :
                        payment.status === "cancelled" ? "bg-rose-400 text-white" :
                        payment.status === "unprocessed" ? "bg-slate-400 text-white" :
                        "bg-red-600 text-white"
                      )}
                    >
                      {payment.status}
                    </span>

                    {(payment.status === "failed" || payment.status === "cancelled") &&
                      (payment.metadata_info?.failure_reason || payment.metadata_info?.cancellation_reason) && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[200px] p-3 bg-gray-900 text-white text-[10px] rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 pointer-events-none z-50">
                          <p className="font-medium leading-relaxed">
                            {payment.metadata_info.failure_reason || payment.metadata_info.cancellation_reason}
                          </p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                       <Calendar size={14} className="text-gray-300" />
                       {new Date(payment.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                       <span className="text-[10px] text-gray-300">@</span>
                       <span className="text-[11px] text-gray-400">{new Date(payment.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
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

export default Payments;
