"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Utensils, Plus, Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface DiningItem {
  id: string
  title: string
  description: string
  price: string
  cuisine: string
  rating: string
  location: string
  specialty: string
}

const sampleRestaurants = [
  {
    id: "d1",
    title: "Thalassa",
    description: "Greek restaurant with stunning sea views and authentic Mediterranean cuisine",
    price: "₹2,000 for 2",
    cuisine: "Greek",
    rating: "4.8",
    location: "Vagator Beach",
    specialty: "Seafood Platter",
  },
  {
    id: "d2",
    title: "Fisherman's Wharf",
    description: "Popular seafood restaurant with Goan and Continental dishes",
    price: "₹1,500 for 2",
    cuisine: "Seafood",
    rating: "4.6",
    location: "Cavelossim",
    specialty: "Fish Curry Rice",
  },
  {
    id: "d3",
    title: "Gunpowder",
    description: "Authentic South Indian cuisine in a cozy garden setting",
    price: "₹1,200 for 2",
    cuisine: "South Indian",
    rating: "4.7",
    location: "Assagao",
    specialty: "Pork Ribs",
  },
  {
    id: "d4",
    title: "La Plage",
    description: "French beachside restaurant with romantic ambiance",
    price: "₹2,500 for 2",
    cuisine: "French",
    rating: "4.9",
    location: "Ashwem Beach",
    specialty: "Bouillabaisse",
  },
  {
    id: "d5",
    title: "Vinayak Family Restaurant",
    description: "Traditional Goan home-style cooking",
    price: "₹800 for 2",
    cuisine: "Goan",
    rating: "4.5",
    location: "Panaji",
    specialty: "Goan Fish Curry",
  },
  {
    id: "d6",
    title: "Sublime",
    description: "Fine dining with innovative fusion cuisine",
    price: "₹3,000 for 2",
    cuisine: "Fusion",
    rating: "4.8",
    location: "Morjim",
    specialty: "Tasting Menu",
  },
]

export default function DiningPage() {
  const router = useRouter()
  const [selectedRestaurants, setSelectedRestaurants] = useState<DiningItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [cuisineFilter, setCuisineFilter] = useState<"all" | "goan" | "seafood" | "international">("all")

  useEffect(() => {
    // Load saved dining selections
    const saved = localStorage.getItem("globetrotter-dining-selections")
    if (saved) {
      setSelectedRestaurants(JSON.parse(saved))
    }
  }, [])

  const handleAddRestaurant = (item: DiningItem) => {
    const updated = [...selectedRestaurants, { ...item, id: `${item.id}-${Date.now()}` }]
    setSelectedRestaurants(updated)
    localStorage.setItem("globetrotter-dining-selections", JSON.stringify(updated))

    // Update progress
    const progress = JSON.parse(localStorage.getItem("globetrotter-trip-progress") || "[]")
    if (!progress.includes("dining")) {
      progress.push("dining")
      localStorage.setItem("globetrotter-trip-progress", JSON.stringify(progress))
    }
  }

  const handleRemoveRestaurant = (id: string) => {
    const updated = selectedRestaurants.filter((item) => item.id !== id)
    setSelectedRestaurants(updated)
    localStorage.setItem("globetrotter-dining-selections", JSON.stringify(updated))
  }

  const getFilteredResults = () => {
    return sampleRestaurants.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesCuisine = true
      if (cuisineFilter !== "all") {
        if (cuisineFilter === "goan") matchesCuisine = item.cuisine.toLowerCase() === "goan"
        else if (cuisineFilter === "seafood") matchesCuisine = item.cuisine.toLowerCase() === "seafood"
        else if (cuisineFilter === "international")
          matchesCuisine = !["goan", "seafood"].includes(item.cuisine.toLowerCase())
      }

      return matchesSearch && matchesCuisine
    })
  }

  const handleFinish = () => {
    router.push("/manual-itinerary-builder")
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
            <div className="text-white text-2xl font-bold">DINING SELECTION</div>
          </div>
          <Button
            onClick={handleFinish}
            className="bg-green-500 hover:bg-green-600 text-white font-bold border-2 border-white"
          >
            FINISH PLANNING →
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Search & Available Restaurants */}
          <div className="space-y-6">
            <div className="bg-white border-4 border-black p-6">
              <h3 className="text-lg font-black text-black mb-4 uppercase flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Available Restaurants
              </h3>

              {/* Search Controls */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                  <Input
                    placeholder="SEARCH RESTAURANTS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold placeholder:text-gray-500 placeholder:font-bold"
                  />
                </div>
                <Select value={cuisineFilter} onValueChange={(value: any) => setCuisineFilter(value)}>
                  <SelectTrigger className="w-40 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ALL CUISINE</SelectItem>
                    <SelectItem value="goan">GOAN</SelectItem>
                    <SelectItem value="seafood">SEAFOOD</SelectItem>
                    <SelectItem value="international">INTERNATIONAL</SelectItem>
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
                          <Utensils className="w-5 h-5 text-orange-500" />
                          <h4 className="font-black text-black uppercase">{item.title}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-xs font-bold">{item.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-black font-medium mb-2">{item.description}</p>
                        <p className="text-xs text-gray-600 font-bold mb-2">📍 {item.location}</p>
                        <div className="flex items-center gap-4 text-xs text-black font-bold mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 border border-blue-300">
                            {item.cuisine.toUpperCase()}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 border border-green-300">
                            {item.specialty}
                          </span>
                        </div>
                        <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold inline-block">
                          {item.price}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddRestaurant(item)}
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

          {/* Selected Restaurants */}
          <div className="bg-white border-4 border-black p-6">
            <h3 className="text-lg font-black text-black mb-4 uppercase">Your Selected Restaurants</h3>

            {selectedRestaurants.length > 0 ? (
              <div className="space-y-4">
                {selectedRestaurants.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 border-2 border-black p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 bg-orange-500 border-2 border-black flex items-center justify-center flex-shrink-0">
                          <Utensils className="w-4 h-4 text-white" />
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
                          <div className="flex items-center gap-2 text-xs text-black font-bold mb-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 border border-blue-300">
                              {item.cuisine.toUpperCase()}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 border border-green-300">
                              {item.specialty}
                            </span>
                          </div>
                          <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold inline-block">
                            {item.price}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveRestaurant(item.id)}
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
                <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-black font-bold uppercase">
                  No restaurants selected yet. Choose from available options.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}