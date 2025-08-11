"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Hotel, Plus, Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface HotelItem {
  id: string
  title: string
  description: string
  price: string
  rating: string
  amenities: string[]
  location: string
}

const sampleHotels = [
  {
    id: "h1",
    title: "Taj Exotica Resort & Spa",
    description: "5-star beachfront resort with world-class amenities",
    price: "3000",
    rating: "4.8",
    amenities: ["Pool", "Spa", "Beach Access", "WiFi"],
    location: "Benaulim Beach",
  },
  {
    id: "h2",
    title: "The Leela Goa",
    description: "Luxury beach resort with premium facilities",
    price: "4000",
    rating: "4.9",
    amenities: ["Pool", "Golf Course", "Spa", "Multiple Restaurants"],
    location: "Cavelossim Beach",
  },
  {
    id: "h3",
    title: "Grand Hyatt Goa",
    description: "Contemporary luxury resort",
    price: "10500",
    rating: "4.7",
    amenities: ["Pool", "Fitness Center", "Spa", "Business Center"],
    location: "Bambolim",
  },
  {
    id: "h4",
    title: "Alila Diwa Goa",
    description: "Boutique resort with traditional charm",
    price: "6500",
    rating: "4.6",
    amenities: ["Pool", "Spa", "Yoga", "Organic Garden"],
    location: "Majorda Beach",
  },
]

export default function HotelsPage() {
  const router = useRouter()
  const [selectedHotels, setSelectedHotels] = useState<HotelItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState<"all" | "budget" | "mid" | "luxury">("all")

  useEffect(() => {
    // Load saved hotel selections
    const saved = localStorage.getItem("hotel-selections")
    if (saved) {
      setSelectedHotels(JSON.parse(saved))
    }
  }, [])

  const handleAddHotel = (item: HotelItem) => {
    const updated = [...selectedHotels, { ...item, id: `${item.id}-${Date.now()}` }]
    setSelectedHotels(updated)
    localStorage.setItem("hotel-selections", JSON.stringify(updated))

    // Update progress
    const progress = JSON.parse(localStorage.getItem("trip-progress") || "[]")
    if (!progress.includes("hotels")) {
      progress.push("hotels")
      localStorage.setItem("trip-progress", JSON.stringify(progress))
    }
  }

  const handleRemoveHotel = (id: string) => {
    const updated = selectedHotels.filter((item) => item.id !== id)
    setSelectedHotels(updated)
    localStorage.setItem("hotel-selections", JSON.stringify(updated))
  }

  const getFilteredResults = () => {
    return sampleHotels.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesPrice = true
      if (priceRange !== "all") {
        const price = Number.parseInt(item.price.replace(/[₹,/night]/g, ""))
        if (priceRange === "budget") matchesPrice = price < 8000
        else if (priceRange === "mid") matchesPrice = price >= 8000 && price < 12000
        else if (priceRange === "luxury") matchesPrice = price >= 12000
      }

      return matchesSearch && matchesPrice
    })
  }

  const handleContinue = () => {
    router.push("/manual-itinerary-builder/activities")
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
            <div className="text-white text-2xl font-bold">HOTEL SELECTION</div>
          </div>
          <Button
            onClick={handleContinue}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-white"
          >
            CONTINUE TO ACTIVITIES →
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Search & Available Hotels */}
          <div className="space-y-6">
            <div className="bg-white border-4 border-black p-6">
              <h3 className="text-lg font-black text-black mb-4 uppercase flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                Available Hotels
              </h3>

              {/* Search Controls */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                  <Input
                    placeholder="SEARCH HOTELS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold placeholder:text-gray-500 placeholder:font-bold"
                  />
                </div>
                <Select value={priceRange} onValueChange={(value: any) => setPriceRange(value)}>
                  <SelectTrigger className="w-32 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ALL</SelectItem>
                    <SelectItem value="budget">BUDGET</SelectItem>
                    <SelectItem value="mid">MID-RANGE</SelectItem>
                    <SelectItem value="luxury">LUXURY</SelectItem>
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
                          <Hotel className="w-5 h-5 text-green-500" />
                          <h4 className="font-black text-black uppercase">{item.title}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-xs font-bold">{item.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-black font-medium mb-2">{item.description}</p>
                        <p className="text-xs text-gray-600 font-bold mb-2">📍 {item.location}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.amenities.map((amenity) => (
                            <span
                              key={amenity}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 border border-blue-300 font-bold"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                        <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold inline-block">
                          {item.price}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddHotel(item)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-black ml-4"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Hotels */}
          <div className="bg-white border-4 border-black p-6">
            <h3 className="text-lg font-black text-black mb-4 uppercase">Your Selected Hotels</h3>

            {selectedHotels.length > 0 ? (
              <div className="space-y-4">
                {selectedHotels.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 border-2 border-black p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 bg-green-500 border-2 border-black flex items-center justify-center flex-shrink-0">
                          <Hotel className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-black uppercase">{item.title}</h4>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-xs font-bold">{item.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-black font-medium mb-2">{item.description}</p>
                          <p className="text-xs text-gray-600 font-bold mb-2">📍 {item.location}</p>
                          <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold inline-block">
                            {item.price}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveHotel(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black w-8 h-8 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Hotel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-black font-bold uppercase">No hotels selected yet. Choose from available options.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}