import React, { useState, useEffect } from "react";
import { apiClient } from "../services/api";
import { X, Plus } from "lucide-react";
import { toast } from "react-toastify";

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  editingCategory,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [loading, setLoading] = useState(false);

  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#6366f1",
    "#d946ef",
    "#14b8a6",
  ];

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setDescription(editingCategory.description || "");
      setColor(editingCategory.color || "#3b82f6");
    } else {
      setName("");
      setDescription("");
      setColor("#3b82f6");
    }
  }, [editingCategory, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { name, description, color };
      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory.id}`, data);
        toast.success("✅ Category updated!");
      } else {
        await apiClient.post("/categories", data);
        toast.success("✅ Category created!");
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {editingCategory ? "Edit Category" : "New Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-smooth"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-slideIn" style={{ animationDelay: "0.1s" }}>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-smooth"
              placeholder="e.g., Food, Transport"
              autoFocus
            />
          </div>

          <div className="animate-slideIn" style={{ animationDelay: "0.2s" }}>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-smooth resize-none"
              placeholder="Optional description"
              rows="3"
            />
          </div>

          <div className="animate-slideIn" style={{ animationDelay: "0.3s" }}>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Color
            </label>
            <div className="flex gap-2 flex-wrap mb-3">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-smooth transform hover:scale-110 ${
                    color === c ?
                      "ring-2 ring-offset-2 ring-gray-800 dark:ring-offset-gray-800 scale-110"
                    : ""
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg shadow-md transition-smooth"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:border-blue-500 transition-smooth font-mono text-sm"
              />
            </div>
          </div>

          <div
            className="flex gap-3 pt-4 animate-slideIn"
            style={{ animationDelay: "0.4s" }}
          >
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ?
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              : <>
                  <Plus size={18} />
                  {editingCategory ? "Update" : "Create"}
                </>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
