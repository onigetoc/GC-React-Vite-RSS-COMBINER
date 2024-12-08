import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export function Navigation() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold">
            RSS Tools
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm hover:text-primary">
              Combine RSS
            </Link>
            <Link to="/json" className="text-sm hover:text-primary">
              RSS to JSON
            </Link>
            <Link to="/preview" className="text-sm hover:text-primary">
              RSS Preview
            </Link>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </nav>
  );
}