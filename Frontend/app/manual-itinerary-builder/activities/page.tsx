"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Camera, Plus, Search, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface ActivityItem {
  id: string
  title: string
  description: string
  price: string
  duration: string
  category: string
  location: string
}

const sampleActivities = [
  {
    id: "a1",
    title: "Dudhsagar Falls Trek",
    description: "Full day adventure trek to India's tallest waterfall",
    price: "2500",
    duration: "8 hours",
    category: "Adventure",
    location: "Mollem National Park",
  },
  {
    id: "a2",
    title: "Sunset Cruise",
    description: "Romantic sunset cruise on Mandovi River",
    price: "1200",
    duration: "2 hours",
    category: "Leisure",
    location: "Panaji",
  },
  {
    id: "a3",
    title: "Spice Plantation Tour",
    description: "Guided tour of organic spice plantations",
    price: "800",
    duration: "4 hours",
    category: "Cultural",
    location: "Ponda",
  },
  {
    id: "a4",
    title: "Scuba Diving",
    description: "Underwater adventure with certified instructors",
    price: "3500",
    duration: "3 hours",
    category: "Adventure",
    location: "Grande Island",
  },
  {
    id: "a5",
    title: "Old Goa Heritage Walk",
    description: "Historical walking tour of UNESCO sites",
    price: "600",
    duration: "3 hours",
    category: "Cultural",
    location: "Old Goa",
  },
  {
    id: "a6",
    title: "Beach Hopping",
    description: "Visit multiple beaches in one day",
    price: "1800",
    duration: "6 hours",
    category: "Leisure",
    location: "South Goa",
  },
]

export default function ActivitiesPage() {
  const router = useRouter()
  const [selectedActivities, setSelectedActivities] = useState<ActivityItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "adventure" | "cultural" | "leisure">("all")

  useEffect(() => {
    // Load saved activity selections
    const saved = localStorage.getItem("globetrotter-activity-selections")
    if (saved) {
      setSelectedActivities(JSON.parse(saved))
    }
  }, [])

  const handleAddActivity = (item: ActivityItem) => {
    const updated = [...selectedActivities, { ...item, id: `${item.id}-${Date.now()}` }]
    setSelectedActivities(updated)
    localStorage.setItem("globetrotter-activity-selections", JSON.stringify(updated))

    // Update progress
    const progress = JSON.parse(localStorage.getItem("globetrotter-trip-progress") || "[]")
    if (!progress.includes("activities")) {
      progress.push("activities")
      localStorage.setItem("globetrotter-trip-progress", JSON.stringify(progress))
    }
  }

  const handleRemoveActivity = (id: string) => {
    const updated = selectedActivities.filter((item) => item.id !== id)
    setSelectedActivities(updated)
    localStorage.setItem("globetrotter-activity-selections", JSON.stringify(updated))
  }

  const getFilteredResults = () => {
    return sampleActivities.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter

      return matchesSearch && matchesCategory
    })
  }

  const handleContinue = () => {
    router.push("/manual-itinerary-builder/dining")
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
            <div className="text-white text-2xl font-bold">ACTIVITIES SELECTION</div>
          </div>
          <Button
            onClick={handleContinue}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-white"
          >
            CONTINUE TO DINING →
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Search & Available Activities */}
          <div className="space-y-6">
            <div className="bg-white border-4 border-black p-6">
              <h3 className="text-lg font-black text-black mb-4 uppercase flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Available Activities
              </h3>

              {/* Search Controls */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                  <Input
                    placeholder="SEARCH ACTIVITIES..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold placeholder:text-gray-500 placeholder:font-bold"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                  <SelectTrigger className="w-32 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ALL</SelectItem>
                    <SelectItem value="adventure">ADVENTURE</SelectItem>
                    <SelectItem value="cultural">CULTURAL</SelectItem>
                    <SelectItem value="leisure">LEISURE</SelectItem>
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
                          <Camera className="w-5 h-5 text-purple-500" />
                          <h4 className="font-black text-black uppercase">{item.title}</h4>
                          <span
                            className={`text-xs px-2 py-1 border font-bold ${
                              item.category === "Adventure"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : item.category === "Cultural"
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-green-100 text-green-800 border-green-300"
                            }`}
                          >
                            {item.category.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-black font-medium mb-2">{item.description}</p>
                        <p className="text-xs text-gray-600 font-bold mb-2">📍 {item.location}</p>
                        <div className="flex items-center gap-4 text-xs text-black font-bold">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.duration}</span>
                          </div>
                          <div className="bg-yellow-400 border border-black px-2 py-1">{item.price}</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddActivity(item)}
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

          {/* Selected Activities */}
          <div className="bg-white border-4 border-black p-6">
            <h3 className="text-lg font-black text-black mb-4 uppercase">Your Selected Activities</h3>

            {selectedActivities.length > 0 ? (
              <div className="space-y-4">
                {selectedActivities.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 border-2 border-black p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 bg-purple-500 border-2 border-black flex items-center justify-center flex-shrink-0">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-black uppercase">{item.title}</h4>
                            <span
                              className={`text-xs px-2 py-1 border font-bold ${
                                item.category === "Adventure"
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : item.category === "Cultural"
                                    ? "bg-blue-100 text-blue-800 border-blue-300"
                                    : "bg-green-100 text-green-800 border-green-300"
                              }`}
                            >
                              {item.category.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-black font-medium mb-2">{item.description}</p>
                          <p className="text-xs text-gray-600 font-bold mb-2">📍 {item.location}</p>
                          <div className="flex items-center gap-4 text-xs text-black font-bold">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.duration}</span>
                            </div>
                            <div className="bg-yellow-400 border border-black px-2 py-1">{item.price}</div>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveActivity(item.id)}
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
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-black font-bold uppercase">
                  No activities selected yet. Choose from available options.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}