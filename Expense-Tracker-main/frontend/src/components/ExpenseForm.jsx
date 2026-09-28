import React, { useState, useEffect } from "react";
import { apiClient } from "../services/api";
import { X, Plus } from "lucide-react";
import { toast } from "react-toastify";

export default function ExpenseForm({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  categories,
}) {
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setType(editingExpense.type || "expense");
      setDescription(editingExpense.description);
      setAmount(editingExpense.amount);
      setCategoryId(editingExpense.category_id);
      setTags(editingExpense.tags || "");
      setDate(editingExpense.date.split("T")[0]);
    } else {
      setType("expense");
      setDescription("");
      setAmount("");
      setCategoryId(categories[0]?.id || "");
      setTags("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [editingExpense, isOpen, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !categoryId) {
      toast.error("❌ Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const data = {
        type,
        description,
        amount: parseFloat(amount),
        category_id: parseInt(categoryId),
        tags,
        date: new Date(date).toISOString(),
      };

      if (editingExpense) {
        await apiClient.put(`/expenses/${editingExpense.id}`, data);
        toast.success("✅ Expense updated!");
      } else {
        await apiClient.post("/expenses", data);
        toast.success("✅ Expense added!");
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-slideUp">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto modal-enter">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold bg-gradient-to-r ${type === 'income' ? 'from-green-600 to-emerald-600' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
            {editingExpense ? `Edit ${type === 'income' ? 'Income' : 'Expense'}` : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-smooth">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl animate-slideIn">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 py-2 rounded-lg font-semibold transition-smooth ${
                type === "expense"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 py-2 rounded-lg font-semibold transition-smooth ${
                type === "income"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              Income
            </button>
          </div>

          <div className="animate-slideIn" style={{ animationDelay: "0.1s" }}>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-smooth"
              placeholder={type === 'income' ? "Where did this income come from?" : "What did you spend on?"}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="animate-slideIn" style={{ animationDelay: "0.2s" }}>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Amount (₹) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                step="1"
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-smooth"
                placeholder="0"
              />
            </div>

            <div className="animate-slideIn" style={{ animationDelay: "0.2s" }}>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-smooth"
              />
            </div>
          </div>

          <div className="animate-slideIn" style={{ animationDelay: "0.3s" }}>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white transition-smooth"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="animate-slideIn" style={{ animationDelay: "0.4s" }}>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-smooth"
              placeholder={type === 'income' ? "e.g., salary, freelance, bonus" : "e.g., food, restaurant"}
            />
          </div>

          <div className="flex gap-3 pt-4 animate-slideIn" style={{ animationDelay: "0.5s" }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-smooth"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${type === 'income' ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'} text-white rounded-lg font-semibold transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  {editingExpense ? "Update" : "Save"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
