"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Plane, Train, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface TravelItem {
  id: string
  type: "flight" | "train"
  title: string
  description: string
  price: string
  duration: string
  departure: string
  arrival: string
}

const sampleFlights = [
  {
    id: "f1",
    type: "flight" as const,
    title: "Delhi to Goa",
    description: "IndiGo 6E-173",
    price: "4500",
    duration: "2h 30m",
    departure: "10:30 AM",
    arrival: "1:00 PM",
  },
  {
    id: "f2",
    type: "flight" as const,
    title: "Mumbai to Goa",
    description: "Air India AI-631",
    price: "3800",
    duration: "1h 45m",
    departure: "2:15 PM",
    arrival: "4:00 PM",
  },
  {
    id: "f3",
    type: "flight" as const,
    title: "Bangalore to Goa",
    description: "SpiceJet SG-116",
    price: "4200",
    duration: "1h 30m",
    departure: "6:45 AM",
    arrival: "8:15 AM",
  },
]

const sampleTrains = [
  {
    id: "t1",
    type: "train" as const,
    title: "Rajdhani Express",
    description: "New Delhi to Mumbai",
    price: "2800",
    duration: "16h 30m",
    departure: "4:00 PM",
    arrival: "8:30 AM+1",
  },
  {
    id: "t2",
    type: "train" as const,
    title: "Shatabdi Express",
    description: "Mumbai to Goa",
    price: "1200",
    duration: "12h 15m",
    departure: "10:15 PM",
    arrival: "10:30 AM+1",
  },
]

export default function TravelPage() {
  const router = useRouter()
  const [selectedTravel, setSelectedTravel] = useState<TravelItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [travelType, setTravelType] = useState<"all" | "flight" | "train">("all")

  useEffect(() => {
    // Load saved travel selections
    const saved = localStorage.getItem("globetrotter-travel-selections")
    if (saved) {
      setSelectedTravel(JSON.parse(saved))
    }
  }, [])

  const handleAddTravel = (item: TravelItem) => {
    const updated = [...selectedTravel, { ...item, id: `${item.id}-${Date.now()}` }]
    setSelectedTravel(updated)
    localStorage.setItem("globetrotter-travel-selections", JSON.stringify(updated))

    // Update progress
    const progress = JSON.parse(localStorage.getItem("globetrotter-trip-progress") || "[]")
    if (!progress.includes("travel")) {
      progress.push("travel")
      localStorage.setItem("globetrotter-trip-progress", JSON.stringify(progress))
    }
  }

  const handleRemoveTravel = (id: string) => {
    const updated = selectedTravel.filter((item) => item.id !== id)
    setSelectedTravel(updated)
    localStorage.setItem("globetrotter-travel-selections", JSON.stringify(updated))
  }

  const getFilteredResults = () => {
    const allResults = [...sampleFlights, ...sampleTrains]
    return allResults.filter((item) => {
      const matchesType = travelType === "all" || item.type === travelType
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }

  const handleContinue = () => {
    router.push("/manual-itinerary-builder/hotels")
  }

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
            <div className="text-white text-2xl font-bold">TRAVEL SELECTION</div>
          </div>
          <Button
            onClick={handleContinue}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-white"
          >
            CONTINUE TO HOTELS →
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Search & Available Options */}
          <div className="space-y-6">
            <div className="bg-white border-4 border-black p-6">
              <h3 className="text-lg font-black text-black mb-4 uppercase flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Available Travel Options
              </h3>

              {/* Search Controls */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                  <Input
                    placeholder="SEARCH FLIGHTS & TRAINS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold placeholder:text-gray-500 placeholder:font-bold"
                  />
                </div>
                <Select value={travelType} onValueChange={(value: any) => setTravelType(value)}>
                  <SelectTrigger className="w-32 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ALL</SelectItem>
                    <SelectItem value="flight">FLIGHTS</SelectItem>
                    <SelectItem value="train">TRAINS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getFilteredResults().map((item) => (
                  <div key={item.id} className="bg-gray-50 border-2 border-black p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.type === "flight" ? (
                            <Plane className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Train className="w-5 h-5 text-green-500" />
                          )}
                          <h4 className="font-black text-black uppercase">{item.title}</h4>
                        </div>
                        <p className="text-sm text-black font-medium mb-2">{item.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-black font-bold">
                          <span>Price: {item.price}</span>
                          <span>Duration: {item.duration}</span>
                          <span>Departure: {item.departure}</span>
                          <span>Arrival: {item.arrival}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddTravel(item)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-black"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Travel */}
          <div className="bg-white border-4 border-black p-6">
            <h3 className="text-lg font-black text-black mb-4 uppercase">Your Selected Travel</h3>

            {selectedTravel.length > 0 ? (
              <div className="space-y-4">
                {selectedTravel.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 border-2 border-black p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 bg-blue-500 border-2 border-black flex items-center justify-center flex-shrink-0">
                          {item.type === "flight" ? (
                            <Plane className="w-4 h-4 text-white" />
                          ) : (
                            <Train className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-black uppercase">{item.title}</h4>
                          <p className="text-sm text-black font-medium mb-2">{item.description}</p>
                          <div className="grid grid-cols-2 gap-1 text-xs text-black font-bold">
                            <span>
                              {item.departure} → {item.arrival}
                            </span>
                            <span>{item.duration}</span>
                          </div>
                          <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold inline-block mt-2">
                            {item.price}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveTravel(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black w-8 h-8 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </motion.div>
                ))}

                <div className="pt-4 border-t-2 border-black">
                  <div className="flex justify-between items-center">
                    <span className="text-black font-bold">TOTAL TRAVEL COST:</span>
                    <span className="text-xl font-black text-black">
                      ₹
                      {selectedTravel
                        .reduce((sum, item) => sum + Number.parseInt(item.price.replace(/[₹,]/g, "")), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-black font-bold uppercase">No travel selected yet. Choose from available options.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}