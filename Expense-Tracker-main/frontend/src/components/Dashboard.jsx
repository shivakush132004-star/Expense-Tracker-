import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts";
import { apiClient } from "../services/api";
import { AlertCircle, TrendingUp, TrendingDown, Calendar, Wallet, Download, PiggyBank } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [month, year]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get(`/stats?month=${month}&year=${year}`);
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    const dashboardElement = document.getElementById("dashboard-report-content");
    if (!dashboardElement) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(dashboardElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.text(`Financial Report - ${month}/${year}`, 10, 10);
      pdf.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight);
      pdf.save(`financial-report-${year}-${month}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF", error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block">
          <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-3">Loading statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-10 text-gray-600 dark:text-gray-400">No data available</div>;
  }

  const categoryData = Object.entries(stats.category_breakdown).map(
    ([name, value]) => ({
      name,
      value: parseFloat(value),
    }),
  );

  const savingsRate = stats.total_income > 0 
    ? ((stats.total_income - stats.total_expenses) / stats.total_income) * 100 
    : 0;

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"];

  return (
    <div className="space-y-6">
      {/* Header with filters and Export */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-smooth">
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-smooth"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2024, m - 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-smooth"
              />
            </div>
          </div>
          <button 
            onClick={exportPDF} 
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 dark:from-gray-100 dark:to-white dark:text-gray-900 dark:hover:from-gray-200 text-white rounded-xl font-medium transition-smooth shadow-sm disabled:opacity-50"
          >
            {exporting ? (
              <div className="w-5 h-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {exporting ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div id="dashboard-report-content" className="space-y-6 pb-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-sm p-6 text-white transition-smooth transform hover:-translate-y-1 hover:shadow-md card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 font-medium mb-1">Current Balance</p>
                <p className="text-3xl font-bold tracking-tight">₹{stats.current_balance?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Wallet size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-6 transition-smooth transform hover:-translate-y-1 hover:shadow-md card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total Income</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">₹{(stats.total_income || 0).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-6 transition-smooth transform hover:-translate-y-1 hover:shadow-md card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">₹{(stats.total_expenses || 0).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                <TrendingDown size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-6 transition-smooth transform hover:-translate-y-1 hover:shadow-md card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Savings Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{savingsRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                <PiggyBank size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Monthly Trend */}
          {stats.monthly_data && (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-6 transition-smooth">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                📈 Income vs Expense
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={stats.monthly_data}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" stroke="#9ca3af" axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => `₹${value.toFixed(2)}`} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                  <Line type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Breakdown Pie Chart */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-6 transition-smooth">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              📊 Expense Breakdown
            </h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => `₹${value.toFixed(2)}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-gray-400">
                No expense data available for this period.
              </div>
            )}
          </div>
        </div>

        {/* Budget Alerts */}
        {stats.budget_alerts && stats.budget_alerts.length > 0 && (
          <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-500">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                Budget Alerts
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.budget_alerts.map((alert, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-red-100 dark:border-red-900/30 shadow-sm transition-smooth hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-gray-900 dark:text-white">{alert.category}</p>
                    <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-bold rounded-full">
                      Over Budget
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Budget limit:</span>
                      <span className="font-medium">₹{alert.limit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total spent:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">₹{alert.spent.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
