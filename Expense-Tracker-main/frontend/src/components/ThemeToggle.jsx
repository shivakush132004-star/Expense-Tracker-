import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:scale-105 transition-transform"
      title="Toggle theme"
    >
      {theme === "dark" ?
        <Sun size={16} />
      : <Moon size={16} />}
      <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">
        {theme === "dark" ? "Light" : "Dark"}
      </span>
    </button>
  );
}
