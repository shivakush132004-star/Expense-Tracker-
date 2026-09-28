import React, { useState, useEffect } from "react";
import { Plus, Download } from "lucide-react";
import { toast } from "react-toastify";
import CategoryModal from "../components/CategoryModal";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import BudgetModal from "../components/BudgetModal";
import { apiClient } from "../services/api";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesData, categoriesData] = await Promise.all([
        apiClient.get("/expenses?limit=500"),
        apiClient.get("/categories"),
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await apiClient.downloadCSV();
      toast.success("Expenses exported!");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsExpenseFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus size={20} />
          Add Expense
        </button>
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          <Plus size={20} />
          New Category
        </button>
        <button
          onClick={() => setIsBudgetModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          <Plus size={20} />
          Set Budget
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Expense List */}
      <ExpenseList
        expenses={expenses}
        categories={categories}
        onEdit={(expense) => {
          setEditingExpense(expense);
          setIsExpenseFormOpen(true);
        }}
        onRefresh={fetchData}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Modals */}
      <ExpenseForm
        isOpen={isExpenseFormOpen}
        onClose={() => {
          setIsExpenseFormOpen(false);
          setEditingExpense(null);
        }}
        onSave={fetchData}
        editingExpense={editingExpense}
        categories={categories}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={fetchData}
        editingCategory={null}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={fetchData}
        categories={categories}
        month={new Date().getMonth() + 1}
        year={new Date().getFullYear()}
      />
    </div>
  );
}
