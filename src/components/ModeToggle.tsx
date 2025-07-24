'use client'
import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative px-1 py-0.5 rounded-md transition-all duration-300
      border-amber-500 dark:border-amber-600
      hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:ring-2 hover:ring-amber-500 hover:ring-opacity-40"
    >
      <span className="absolute -inset-2 bg-amber-200 dark:bg-amber-900/40 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />

      <SunIcon
        className="h-5 w-5 absolute text-amber-500 dark:text-amber-400 transition-all duration-300 ease-in-out transform dark:rotate-0 dark:scale-100 rotate-0 scale-100"
      />
      
      <MoonIcon
        className="h-5 w-5 absolute text-amber-500 dark:text-amber-400 transition-all duration-300 ease-in-out transform dark:rotate-0 dark:scale-100 rotate-90 scale-0"
      />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
