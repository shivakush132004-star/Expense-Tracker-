import React, { useState, useEffect } from "react";
import { apiClient } from "../services/api";
import { Download, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/categories");
      setCategories(data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Delete this category? Associated expenses will remain.")
    )
      return;

    try {
      await apiClient.delete(`/categories/${id}`);
      toast.success("Category deleted!");
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat, idx) => (
        <div 
          key={cat.id} 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-smooth transform hover:-translate-y-1 hover:shadow-md animate-slideUp group"
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-14 h-14 rounded-xl shadow-inner flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: cat.color }}
            >
              {cat.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => handleDelete(cat.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-smooth opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Delete Category"
            >
              <Trash2 size={20} />
            </button>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{cat.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 h-10 overflow-hidden text-ellipsis line-clamp-2">
            {cat.description || "No description provided."}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
            <p className="text-xs font-mono text-gray-400 dark:text-gray-500">{cat.color.toUpperCase()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
