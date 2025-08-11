import type React from "react"
import { ItineraryProvider } from "./_context/ItineraryContext"

export default function ManualItineraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ItineraryProvider>{children}</ItineraryProvider>
}