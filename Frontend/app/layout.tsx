import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/app/providers/theme-provider" // Use the custom ThemeProvider
import { Toaster } from "@/components/ui/toaster"
import { UserProvider } from "./context/UserContext"
import { AlertProvider } from "./context/AlertContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GhumoFiro - Your Travel Companion",
  description: "Plan amazing trips with AI assistance and connect with fellow travelers",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <html lang="en">
        <body className={inter.className}>
          <UserProvider>
            <AlertProvider>
              {children}
            </AlertProvider>
            <Toaster />
          </UserProvider>
        </body>
      </html>
    </ThemeProvider>
  )
}
