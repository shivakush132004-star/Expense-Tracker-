import React, { useState, useEffect } from "react";
import { apiClient } from "../services/api";
import { X, AlertCircle, Plus } from "lucide-react";
import { toast } from "react-toastify";

export default function BudgetModal({ isOpen, onClose, onSave, categories, month, year }) {
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [localCategories, setLocalCategories] = useState([]);

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Update local categories when prop changes
  useEffect(() => {
    if (categories && categories.length > 0) {
      setLocalCategories(categories);
      if (!categoryId && categories.length > 0) {
        setCategoryId(categories[0].id.toString());
      }
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const data = await apiClient.get("/categories");
      setLocalCategories(data);
      if (data.length > 0) {
        setCategoryId(data[0].id.toString());
      }
    } catch (error) {
      toast.error("❌ Failed to load categories");
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId || !amount) {
      toast.error("❌ Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/budget-limits", {
        category_id: parseInt(categoryId),
        amount: parseFloat(amount),
        month,
        year,
      });
      toast.success("✅ Budget limit set successfully!");
      setCategoryId(localCategories[0]?.id?.toString() || "");
      setAmount("");
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message || "❌ Failed to set budget limit");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-slideUp">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto modal-enter">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Set Budget Limit
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {month ? new Date(2024, month - 1).toLocaleString("default", { month: "long" }) : "This month"} {year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-smooth"
          >
            <X size={24} />
          </button>
        </div>

        {localCategories.length === 0 ? (
          <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-start gap-3 animate-slideIn">
            <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">No categories found</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Create a category first before setting a budget.</p>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-slideIn" style={{ animationDelay: "0.1s" }}>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Select Category *
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={localCategories.length === 0}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-smooth bg-white font-medium appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Choose a category...</option>
                {localCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="animate-slideIn" style={{ animationDelay: "0.2s" }}>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Budget Limit Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 font-semibold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                step="100"
                min="0"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-smooth text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="5,000"
                disabled={localCategories.length === 0}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">You will be alerted when spending exceeds this amount</p>
          </div>

          {categoryId && amount && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-2 border-blue-100 dark:border-blue-800 animate-slideIn" style={{ animationDelay: "0.3s" }}>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-2">📊 Budget Summary</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {localCategories.find((c) => c.id === parseInt(categoryId))?.name || "Selected category"}
                </span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{parseFloat(amount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 animate-slideIn" style={{ animationDelay: "0.4s" }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-smooth"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || localCategories.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Set Budget Limit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
