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
        bg-[#F7FBFC] dark:bg-[#050B14]/70
        border-2 border-[#DCEEEE] dark:border-[#1E3A4A]
        hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D]/80 
        hover:border-[#2FD1C5] dark:hover:border-[#0FD9C3]
        hover:shadow-lg hover:shadow-[#6EE7D8]/30 dark:hover:shadow-[#0FD9C3]/30
        active:scale-95"
    >
      {/* Glow effect */}
      <span className="absolute -inset-1 bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] rounded-lg opacity-0 group-hover:opacity-20 transition-all duration-500 blur-sm" />

      {/* Sun Icon - visible in dark mode (when we want to switch to light) */}
      <SunIcon
        className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          text-[#1E5AA8] dark:text-[#6EE7D8] 
          transition-all duration-500 ease-in-out
          dark:rotate-0 dark:scale-100 dark:opacity-100
          rotate-90 scale-0 opacity-0"
      />
      
      {/* Moon Icon - visible in light mode (when we want to switch to dark) */}
      <MoonIcon
        className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          text-[#1E5AA8] dark:text-[#6EE7D8]
          transition-all duration-500 ease-in-out
          dark:rotate-90 dark:scale-0 dark:opacity-0
          rotate-0 scale-100 opacity-100"
      />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
