import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ThemeToggleProps {
  inNavbar?: boolean;
  className?: string;
}

export function ThemeToggle({ inNavbar = false, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  // Only render if it's in the navbar
  if (!inNavbar) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`w-10 h-10 rounded-xl relative overflow-hidden group hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 ${className || ''}`}
        >
          <div className="relative w-full h-full">
            <Sun className="h-[1.3rem] w-[1.3rem] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-0 scale-100 transition-all duration-500 ease-spring dark:rotate-90 dark:scale-0 text-yellow-500 group-hover:text-yellow-600" />
            <Moon className="h-[1.3rem] w-[1.3rem] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 scale-0 transition-all duration-500 ease-spring dark:rotate-0 dark:scale-100 text-blue-500 group-hover:text-blue-600" />
          </div>
          <div className="absolute inset-0 rounded-xl ring-2 ring-gray-200 dark:ring-gray-700 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="w-40 rounded-xl p-1 animate-in fade-in-0 zoom-in-95"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <Sun className="w-5 h-5 text-yellow-500 group-hover:animate-spin-slow" />
          </div>
          <span className="font-medium">Light</span>
          {theme === 'light' && (
            <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <Moon className="w-5 h-5 text-blue-500 group-hover:animate-pulse" />
          </div>
          <span className="font-medium">Dark</span>
          {theme === 'dark' && (
            <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </div>
          <span className="font-medium">System</span>
          {theme === 'system' && (
            <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
