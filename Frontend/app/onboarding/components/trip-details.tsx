"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, MapPin, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TripDetailsProps {
  userData: any
  updateUserData: (data: any) => void
  nextStep: () => void
  prevStep: () => void
}

const seasons = ["Summer", "Winter", "Monsoon", "Spring"]
const tripTypes = [
  "Business",
  "Friends",
  "Solo",
  "Couple",
  "Honeymoon",
  "Family",
  "Adventure",
  "Relaxation",
  "Cultural",
  "Wildlife",
]

export default function TripDetails({ userData, updateUserData, nextStep, prevStep }: TripDetailsProps) {
  const [tripDetails, setTripDetails] = useState(userData.tripDetails || {})
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null)

  const allLocations = [...(userData.visitedCities || []), ...(userData.visitedCountries || [])]

  const updateLocationDetails = (location: string, field: string, value: any) => {
    setTripDetails((prev: any) => ({
      ...prev,
      [location]: {
        ...prev[location],
        [field]: value,
      },
    }))
  }

  const toggleTripType = (location: string, type: string) => {
    const currentTypes = tripDetails[location]?.tripType || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t: string) => t !== type)
      : [...currentTypes, type]

    updateLocationDetails(location, "tripType", newTypes)
  }

  const handleContinue = () => {
    updateUserData({ tripDetails })
    window.location.href = "/dashboard"
  }

  const isLocationComplete = (location: string) => {
    const details = tripDetails[location]
    return details?.dateRange?.start && details?.dateRange?.end && details?.season && details?.tripType?.length > 0
  }

  const completedLocations = allLocations.filter(isLocationComplete).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* Header */}
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center">
          <div className="flex items-center gap-2">
            <div className="text-white text-2xl font-bold">globetrotter</div>
            <div className="bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded">BETA</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          {/* Header Message */}
          <div className="bg-white border-4 border-black p-6 mb-8 text-center">
            <h2 className="text-3xl font-black text-black mb-3 uppercase">TELL US ABOUT YOUR TRIPS</h2>
            <p className="text-black font-medium mb-4">Share details about your travel experiences</p>
            <div className="inline-flex items-center gap-2 bg-yellow-400 border-2 border-black px-4 py-2">
              <Calendar className="w-5 h-5 text-black" />
              <span className="font-black text-black uppercase">
                {completedLocations} of {allLocations.length} trips completed
              </span>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-8">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {allLocations.map((location, index) => {
                const isCity = userData.visitedCities?.includes(location)
                const isExpanded = expandedLocation === location
                const isComplete = isLocationComplete(location)
                const details = tripDetails[location] || {}

                return (
                  <motion.div
                    key={location}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-2 border-black transition-all duration-200 ${
                      isComplete ? "bg-yellow-400" : "bg-white"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedLocation(isExpanded ? null : location)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isCity ? <MapPin className="w-5 h-5 text-black" /> : <Globe className="w-5 h-5 text-black" />}
                        <span className="font-bold text-black uppercase">{location}</span>
                        {isComplete && <div className="w-3 h-3 bg-black"></div>}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-black" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-black" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 space-y-4 border-t-2 border-black">
                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-bold text-black uppercase">Start Date</Label>
                                <Input
                                  type="date"
                                  value={details.dateRange?.start || ""}
                                  onChange={(e) =>
                                    updateLocationDetails(location, "dateRange", {
                                      ...details.dateRange,
                                      start: e.target.value,
                                    })
                                  }
                                  className="mt-1 h-10 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-bold text-black uppercase">End Date</Label>
                                <Input
                                  type="date"
                                  value={details.dateRange?.end || ""}
                                  onChange={(e) =>
                                    updateLocationDetails(location, "dateRange", {
                                      ...details.dateRange,
                                      end: e.target.value,
                                    })
                                  }
                                  className="mt-1 h-10 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                                />
                              </div>
                            </div>

                            {/* Season */}
                            <div>
                              <Label className="text-sm font-bold text-black uppercase">Season Visited</Label>
                              <Select
                                value={details.season || ""}
                                onValueChange={(value) => updateLocationDetails(location, "season", value)}
                              >
                                <SelectTrigger className="mt-1 h-10 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold">
                                  <SelectValue placeholder="SELECT SEASON" />
                                </SelectTrigger>
                                <SelectContent>
                                  {seasons.map((season) => (
                                    <SelectItem key={season} value={season.toLowerCase()}>
                                      {season.toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Trip Type */}
                            <div>
                              <Label className="text-sm font-bold text-black mb-2 block uppercase">Trip Type</Label>
                              <div className="flex flex-wrap gap-2">
                                {tripTypes.map((type) => (
                                  <motion.button
                                    key={type}
                                    onClick={() => toggleTripType(location, type)}
                                    className={`px-3 py-1 text-sm font-bold transition-all duration-200 border-2 border-black uppercase ${
                                      details.tripType?.includes(type)
                                        ? "bg-red-500 text-white scale-105"
                                        : "bg-white text-black hover:bg-gray-100"
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {type}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8">
              <Button
                onClick={prevStep}
                className="flex-1 h-12 bg-white hover:bg-gray-50 text-black font-bold border-2 border-black"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                BACK
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black"
              >
                CONTINUE
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
