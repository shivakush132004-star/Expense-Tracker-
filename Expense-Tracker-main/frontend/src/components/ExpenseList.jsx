import React from "react";
import { Edit2, Trash2, Search } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "../services/api";

export default function ExpenseList({
  expenses,
  categories,
  onEdit,
  onRefresh,
  searchTerm,
  onSearchChange,
}) {
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

    try {
      await apiClient.delete(`/expenses/${id}`);
      toast.success("✅ Expense deleted!");
      onRefresh();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "#3b82f6";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const filteredExpenses = expenses.filter((exp) =>
    exp.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md transition-smooth overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="🔍 Search expenses..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-smooth"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                📅 Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Category
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                💰 Amount
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                ⚙️ Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium">No expenses found</p>
                  <p className="text-sm mt-1">Try adjusting your search or create a new expense</p>
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense, idx) => (
                <tr
                  key={expense.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-smooth transform hover:scale-[1.01] hover:shadow-md animate-slideUp"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      expense.type === 'income' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {expense.type ? expense.type.toUpperCase() : 'EXPENSE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className="px-3 py-1 rounded-full text-white text-xs font-semibold transition-smooth transform hover:scale-105 inline-block shadow-sm"
                      style={{
                        backgroundColor: getCategoryColor(expense.category_id),
                      }}
                    >
                      {getCategoryName(expense.category_id)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${
                    expense.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {expense.type === 'income' ? '+' : '-'}₹{expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onEdit(expense)}
                      className="inline-flex items-center justify-center p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-smooth transform hover:scale-110 active:scale-95"
                      title="Edit expense"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="inline-flex items-center justify-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-smooth transform hover:scale-110 active:scale-95"
                      title="Delete expense"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredExpenses.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600 font-semibold transition-smooth flex gap-6">
          <span>
            Income:{" "}
            <span className="text-green-600 dark:text-green-400 font-bold">
              ₹{filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
            </span>
          </span>
          <span>
            Expense:{" "}
            <span className="text-red-600 dark:text-red-400 font-bold">
              ₹{filteredExpenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
