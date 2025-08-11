"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

type ThemeProviderContextType = {
  theme: Theme
  toggleTheme: () => void
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("globetrotter-theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("globetrotter-theme", theme)
    document.documentElement.classList.toggle("dark", theme === "dark")

    // Apply theme-specific text colors
    if (theme === "dark") {
      document.documentElement.style.setProperty("--text-primary", "#f5f5f5")
      document.documentElement.style.setProperty("--text-secondary", "#d1d5db")
    } else {
      document.documentElement.style.setProperty("--text-primary", "#222222")
      document.documentElement.style.setProperty("--text-secondary", "#6b7280")
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return <ThemeProviderContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
