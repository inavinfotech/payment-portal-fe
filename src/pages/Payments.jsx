import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Copy,
  Check,
  Download,
  FileText,
  Table as TableIcon,
  Calendar,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  User
} from "lucide-react";
import { cn } from "../utils/cn";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedApp, setSelectedApp] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
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
      setRefreshing(false);
    }
  };

  const copyToClipboard = (text, e) => {
    e.stopPropagation();
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
        `payments_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export payments", error);
    }
  };

  // Get unique app names for filter dropdown
  const uniqueApps = useMemo(() => {
    const apps = payments.map((p) => p.app_name).filter(Boolean);
    return Array.from(new Set(apps));
  }, [payments]);

  // Filtered payments calculation
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        payment.razorpay_order_id?.toLowerCase().includes(query) ||
        payment.razorpay_payment_id?.toLowerCase().includes(query) ||
        payment.app_name?.toLowerCase().includes(query) ||
        payment.user_id?.toLowerCase().includes(query) ||
        payment.razorpay_account_name?.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus === "all" || payment.status?.toLowerCase() === selectedStatus.toLowerCase();

      const matchesApp =
        selectedApp === "all" || payment.app_name === selectedApp;

      return matchesSearch && matchesStatus && matchesApp;
    });
  }, [payments, searchQuery, selectedStatus, selectedApp]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCount = payments.length;
    const paidPayments = payments.filter((p) => p.status === "paid");
    const totalRevenue = paidPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const successRate = totalCount > 0 ? ((paidPayments.length / totalCount) * 100).toFixed(1) : 0;
    const pendingCount = payments.filter((p) => p.status === "created").length;
    const failedCount = payments.filter((p) => p.status === "failed" || p.status === "cancelled").length;

    return { totalCount, totalRevenue, successRate, pendingCount, failedCount };
  }, [payments]);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-600"></div>
        <p className="text-sm font-semibold text-gray-500">Loading payment ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Transaction History</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100">
              {payments.length} total
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Live overview and detailed audit log of payment attempts across all connected applications.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchPayments(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh payments"
          >
            <RefreshCw size={14} className={cn(refreshing && "animate-spin text-primary-600")} />
            <span>Refresh</span>
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:text-primary-600 hover:border-primary-200 hover:shadow-xs transition-all"
            >
              <FileText size={13} className="text-gray-500" />
              CSV
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-xs transition-all"
            >
              <TableIcon size={13} className="text-emerald-600" />
              Excel
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-600 border border-primary-700 rounded-lg text-xs font-bold text-white hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all"
            >
              <Download size={13} />
              PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Volume</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp size={12} /> From successful transactions
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Success Rate</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.successRate}%</p>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
              {payments.filter((p) => p.status === "paid").length} of {stats.totalCount} completed
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Orders</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingCount}</p>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Awaiting checkout completion</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Failed / Cancelled</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{stats.failedCount}</p>
            <p className="text-[11px] text-rose-500 font-semibold mt-0.5">Interrupted payment attempts</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Field */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Payment ID, App or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600">
            <Filter size={13} className="text-gray-400" />
            <span className="font-semibold text-gray-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="created">Created (Pending)</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="unprocessed">Unprocessed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600">
            <SlidersHorizontal size={13} className="text-gray-400" />
            <span className="font-semibold text-gray-500">App:</span>
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="all">All Apps</option>
              {uniqueApps.map((app) => (
                <option key={app} value={app}>
                  {app}
                </option>
              ))}
            </select>
          </div>

          {(selectedStatus !== "all" || selectedApp !== "all" || searchQuery !== "") && (
            <button
              onClick={() => {
                setSelectedStatus("all");
                setSelectedApp("all");
                setSearchQuery("");
              }}
              className="text-xs font-bold text-primary-600 hover:text-primary-800 underline px-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Payment Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Reference IDs
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  App Origin
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Razorpay Account
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Date & Time
                </th>
                <th className="px-4 py-4 w-10"></th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 bg-gray-100 text-gray-400 rounded-full">
                        <AlertCircle size={24} />
                      </div>
                      <p className="text-sm font-bold text-gray-700">No payment records found</p>
                      <p className="text-xs text-gray-400 max-w-sm">
                        Try adjusting your search criteria or clearing active filters to see all payments.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const isExpanded = expandedRow === payment.id;
                  const isDirectAccount = Boolean(payment.razorpay_account_id);

                  return (
                    <React.Fragment key={payment.id}>
                      <tr
                        onClick={() => toggleRow(payment.id)}
                        className={cn(
                          "hover:bg-gray-50/80 transition-colors cursor-pointer group",
                          isExpanded && "bg-slate-50/80"
                        )}
                      >
                        {/* Reference IDs */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              <span className="text-gray-400 w-9">Order</span>
                              <span className="font-mono text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                                {payment.razorpay_order_id || "N/A"}
                              </span>
                              {payment.razorpay_order_id && (
                                <button
                                  onClick={(e) => copyToClipboard(payment.razorpay_order_id, e)}
                                  className="text-gray-400 hover:text-primary-600 transition-opacity p-0.5 rounded hover:bg-gray-200"
                                  title="Copy Order ID"
                                >
                                  {copiedId === payment.razorpay_order_id ? (
                                    <Check size={12} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              )}
                            </div>

                            {payment.razorpay_payment_id && (
                              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <span className="text-primary-500 w-9">Pay ID</span>
                                <span className="font-mono text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded text-[11px] border border-primary-100">
                                  {payment.razorpay_payment_id}
                                </span>
                                <button
                                  onClick={(e) => copyToClipboard(payment.razorpay_payment_id, e)}
                                  className="text-gray-400 hover:text-primary-600 transition-opacity p-0.5 rounded hover:bg-gray-200"
                                  title="Copy Payment ID"
                                >
                                  {copiedId === payment.razorpay_payment_id ? (
                                    <Check size={12} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* App */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            {payment.app_name}
                          </span>
                        </td>

                        {/* Razorpay Account Badge */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 text-[11px] font-bold text-indigo-800 border border-indigo-150 shadow-2xs">
                              <CreditCard size={12} className="text-indigo-500" />
                              {payment.razorpay_account_name || "Default Account"}
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium mt-0.5">
                              {isDirectAccount ? "Direct Link" : "Via Linked App"}
                            </span>
                          </div>
                        </td>

                        {/* User / Customer ID */}
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="flex items-center gap-1.5">
                            <User size={13} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-700 font-mono">
                              {payment.user_id ? (
                                payment.user_id.length > 16
                                  ? `${payment.user_id.substring(0, 14)}...`
                                  : payment.user_id
                              ) : (
                                <span className="text-gray-300 font-sans italic">Guest</span>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1 font-extrabold text-gray-900">
                            <span className="text-xs text-gray-400 font-semibold">{payment.currency}</span>
                            <span className="text-sm">
                              {payment.amount?.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-2xs border",
                              payment.status === "paid" &&
                                "bg-emerald-50 text-emerald-700 border-emerald-200",
                              payment.status === "created" &&
                                "bg-amber-50 text-amber-700 border-amber-200",
                              (payment.status === "failed" || payment.status === "cancelled") &&
                                "bg-rose-50 text-rose-700 border-rose-200",
                              payment.status === "unprocessed" &&
                                "bg-slate-100 text-slate-600 border-slate-200"
                            )}
                          >
                            {payment.status === "paid" && <CheckCircle2 size={11} className="text-emerald-600" />}
                            {payment.status === "created" && <Clock size={11} className="text-amber-600" />}
                            {(payment.status === "failed" || payment.status === "cancelled") && (
                              <XCircle size={11} className="text-rose-600" />
                            )}
                            {payment.status}
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-700">
                              {new Date(payment.created_at).toLocaleDateString(undefined, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-500 font-mono">
                              {new Date(payment.created_at).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Expand Toggle */}
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <button
                            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all"
                            title="Toggle Details"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50 border-b border-gray-200">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                                  <Info size={14} className="text-primary-600" /> Payment Audit & Metadata Info
                                </h4>
                                <span className="text-[11px] text-gray-400 font-mono">Internal ID: {payment.id}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="text-gray-400 font-semibold block text-[10px] uppercase">
                                    Full User ID:
                                  </span>
                                  <span className="font-mono text-gray-800 break-all">
                                    {payment.user_id || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400 font-semibold block text-[10px] uppercase">
                                    Plan Type:
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {payment.plan_type || "Standard / One-time"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400 font-semibold block text-[10px] uppercase">
                                    Account Mapping Source:
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {isDirectAccount ? (
                                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                                        Saved directly on payment
                                      </span>
                                    ) : (
                                      <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                                        Inherited from App configuration
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Error or Cancellation info if present */}
                              {(payment.metadata_info?.failure_reason || payment.metadata_info?.cancellation_reason) && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs">
                                  <span className="font-bold block mb-1">Error Details:</span>
                                  {payment.metadata_info.failure_reason || payment.metadata_info.cancellation_reason}
                                </div>
                              )}

                              {/* JSON Metadata */}
                              {payment.metadata_info && Object.keys(payment.metadata_info).length > 0 && (
                                <div>
                                  <span className="text-gray-400 font-semibold block text-[10px] uppercase mb-1">
                                    Payload Metadata:
                                  </span>
                                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto">
                                    {JSON.stringify(payment.metadata_info, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>
            Showing <strong className="text-gray-800">{filteredPayments.length}</strong> of{" "}
            <strong className="text-gray-800">{payments.length}</strong> payments
          </span>
          <span className="text-[11px] text-gray-400">
            Click any row to view expanded audit metadata.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Payments;

