"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Edit, Plane, Hotel, Camera, Utensils, MapPin, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface TripDetails {
  destination: string
  budget: string
  startDate: string
  endDate: string
  duration: number
  totalSpent: number
}

interface Selection {
  id: string
  name: string
  price: number
  description: string
  image?: string
}

interface TripSelections {
  travel: Selection[]
  hotels: Selection[]
  activities: Selection[]
}

export default function ReviewPage() {
  const router = useRouter()
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null)
  const [selections, setSelections] = useState<TripSelections>({
    travel: [],
    hotels: [],
    activities: [],
  })

  useEffect(() => {
    const savedDetails = localStorage.getItem("trip-details")
    const travelSelections = localStorage.getItem("travel-selections")
    const hotelSelections = localStorage.getItem("hotel-selections")
    const activitySelections = localStorage.getItem("activity-selections")

    if (savedDetails) {
      setTripDetails(JSON.parse(savedDetails))
    }

    // Merge all categories into TripSelections object
    let loadedSelections: TripSelections = {
      travel: travelSelections ? JSON.parse(travelSelections) : [],
      hotels: hotelSelections ? JSON.parse(hotelSelections) : [],
      activities: activitySelections ? JSON.parse(activitySelections) : [],
    }

    setSelections(loadedSelections)

    // Debug: See what's in localStorage
    console.log("Loaded trip details:", savedDetails ? JSON.parse(savedDetails) : null)
    console.log("Loaded selections:", loadedSelections)
  }, [])

  const calculateTotal = () => {
    let total = 0
    Object.values(selections).forEach((category) => {
      category.forEach((item: { price: number }) => {
        total += Number(item.price)
        console.log(`Adding ${item.price} from to total. Current total: ${total}`)
      })
    })
    return total
  }

  const handleEditSection = (section: string) => {
    router.push(`/manual-itinerary-builder/${section}`)
  }

  const handleConfirmTrip = () => {
    alert("Trip confirmed! This would proceed to booking or save the final itinerary.")
  }

  if (!tripDetails) {
    return <div>Loading...</div>
  }

  const total = calculateTotal()
  const budget = Number.parseFloat(tripDetails.budget)
  const isOverBudget = total > budget

  const sections = [
    { id: "travel", title: "TRAVEL", icon: Plane, color: "bg-blue-500", items: selections.travel },
    { id: "hotels", title: "HOTELS", icon: Hotel, color: "bg-green-500", items: selections.hotels },
    { id: "activities", title: "ACTIVITIES", icon: Camera, color: "bg-purple-500", items: selections.activities },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* Header */}
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/manual-itinerary-builder")}
              className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
            <div className="text-white text-2xl font-bold">TRIP REVIEW</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Trip Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-4 border-black p-6 mb-8">
          <h1 className="text-3xl font-black text-black mb-6 uppercase text-center">Your Complete Itinerary</h1>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="text-black font-bold">DESTINATION: {tripDetails.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                <span className="text-black font-bold">
                  {tripDetails.startDate} - {tripDetails.endDate} ({tripDetails.duration} days)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-500" />
                <span className="text-black font-bold">BUDGET: ${tripDetails.budget}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-500" />
                <span className={`font-bold ${isOverBudget ? "text-red-500" : "text-green-600"}`}>
                  TOTAL COST: ${total}
                </span>
              </div>
            </div>
          </div>

          {isOverBudget && (
            <div className="mt-4 bg-red-100 border-2 border-red-500 p-4">
              <p className="text-red-700 font-bold text-center">
                ⚠️ WARNING: Your selections exceed your budget by ${(total - budget)}
              </p>
            </div>
          )}
        </motion.div>

        {/* Itinerary Sections */}
        {sections.map((section, index) => {
          const Icon = section.icon
          const sectionTotal = section.items.reduce((sum, item) => sum + Number(item.price), 0)

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-4 border-black mb-6"
            >
              <div className={`${section.color} p-4 border-b-4 border-black`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-black text-white">{section.title}</h3>
                    <span className="text-white font-bold">(${sectionTotal})</span>
                  </div>
                  <Button
                    onClick={() => handleEditSection(section.id)}
                    className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    EDIT
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {section.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No selections made</p>
                ) : (
                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <div>
                          <h4 className="text-black font-bold">{item.name}</h4>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-black font-bold text-lg">${item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}

        {/* Final Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white border-4 border-black p-6">
          <div className="text-center space-y-4">
            <div className="text-2xl font-black text-black">
              TOTAL TRIP COST:{" "}
              <span className={isOverBudget ? "text-red-500" : "text-green-600"}>${total}</span>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push("/manual-itinerary-builder")}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-8 py-3 border-2 border-black"
              >
                MAKE CHANGES
              </Button>
              <Button
                onClick={handleConfirmTrip}
                disabled={isOverBudget}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold px-8 py-3 border-2 border-black"
              >
                {isOverBudget ? "OVER BUDGET" : "CONFIRM TRIP"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
