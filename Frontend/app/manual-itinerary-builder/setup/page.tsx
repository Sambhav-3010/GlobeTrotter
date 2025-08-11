"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function TripSetupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    destination: "",
    budget: "",
    startDate: "",
    endDate: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }
    return 0
  }

  const handleSubmit = () => {
    if (formData.destination && formData.budget && formData.startDate && formData.endDate) {
      const tripDetails = {
        ...formData,
        duration: calculateDuration(),
        totalSpent: 0,
      }

      localStorage.setItem("trip-details", JSON.stringify(tripDetails))
      localStorage.setItem("trip-progress", JSON.stringify([]))
      localStorage.setItem(
        "trip-selections",
        JSON.stringify({
          travel: [],
          hotels: [],
          activities: [],
          dining: [],
        }),
      )

      router.push("/manual-itinerary-builder")
    }
  }

  const isFormValid = formData.destination && formData.budget && formData.startDate && formData.endDate

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* Header */}
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
            <div className="text-white text-2xl font-bold">TRIP SETUP</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black p-8"
        >
          <div className="text-center mb-8">
            <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-4xl font-black text-black mb-4 uppercase">Plan Your Trip</h1>
            <p className="text-black font-medium text-lg">
              Let's start with the basics - where are you going and what's your budget?
            </p>
          </div>

          <div className="space-y-6">
            {/* Destination */}
            <div>
              <Label className="text-black font-bold text-lg uppercase mb-2 block">
                <MapPin className="w-5 h-5 inline mr-2" />
                Destination
              </Label>
              <Input
                placeholder="Where are you traveling to?"
                value={formData.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                className="border-2 border-black text-black font-medium h-12 text-lg"
              />
            </div>

            {/* Budget */}
            <div>
              <Label className="text-black font-bold text-lg uppercase mb-2 block">
                <DollarSign className="w-5 h-5 inline mr-2" />
                Total Budget (USD)
              </Label>
              <Input
                type="number"
                placeholder="Enter your total budget"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
                className="border-2 border-black text-black font-medium h-12 text-lg"
              />
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-black font-bold text-lg uppercase mb-2 block">
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="border-2 border-black text-black font-medium h-12"
                />
              </div>
              <div>
                <Label className="text-black font-bold text-lg uppercase mb-2 block">
                  <Calendar className="w-5 h-5 inline mr-2" />
                  End Date
                </Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="border-2 border-black text-black font-medium h-12"
                />
              </div>
            </div>

            {/* Duration Display */}
            {calculateDuration() > 0 && (
              <div className="bg-yellow-400 border-2 border-black p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-black" />
                  <span className="text-black font-bold text-lg uppercase">
                    Trip Duration: {calculateDuration()} Days
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold text-xl h-14 border-2 border-black uppercase"
            >
              Start Planning Trip →
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
