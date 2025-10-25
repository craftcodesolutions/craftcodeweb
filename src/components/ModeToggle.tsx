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
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="group relative h-10 w-10 rounded-lg transition-all duration-300 ease-in-out cursor-pointer
        bg-amber-50 dark:bg-amber-950/50
        border-2 border-amber-200 dark:border-amber-800
        hover:bg-amber-100 dark:hover:bg-amber-900/60 
        hover:border-amber-300 dark:hover:border-amber-700
        hover:shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-amber-900/30
        active:scale-95"
    >
      {/* Glow effect */}
      <span className="absolute -inset-1 bg-gradient-to-r from-amber-200 to-yellow-200 dark:from-amber-800 dark:to-yellow-800 rounded-lg opacity-0 group-hover:opacity-20 transition-all duration-500 blur-sm" />

      {/* Sun Icon - visible in dark mode (when we want to switch to light) */}
      <SunIcon
        className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          text-amber-600 dark:text-amber-400 
          transition-all duration-500 ease-in-out
          dark:rotate-0 dark:scale-100 dark:opacity-100
          rotate-90 scale-0 opacity-0"
      />
      
      {/* Moon Icon - visible in light mode (when we want to switch to dark) */}
      <MoonIcon
        className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          text-amber-600 dark:text-amber-400
          transition-all duration-500 ease-in-out
          dark:rotate-90 dark:scale-0 dark:opacity-0
          rotate-0 scale-100 opacity-100"
      />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
