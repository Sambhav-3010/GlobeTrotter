"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Clock, DollarSign, Star, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RecommendationsProps {
  userData: any
}

const recommendedTrips = [
  {
    id: 1,
    name: "Magical Rajasthan",
    image: "/rajasthan-palace-sunset.png",
    budget: "₹45,000",
    duration: "7 Days",
    rating: 4.8,
    description: "Explore the royal palaces and vibrant culture of Rajasthan",
    highlights: ["Jaipur City Palace", "Udaipur Lake Palace", "Jodhpur Blue City"],
  },
  {
    id: 2,
    name: "Kerala Backwaters",
    image: "/kerala-backwaters-houseboat.png",
    budget: "₹35,000",
    duration: "5 Days",
    rating: 4.9,
    description: "Serene houseboat experience through Kerala's backwaters",
    highlights: ["Alleppey Houseboats", "Munnar Tea Gardens", "Kochi Fort"],
  },
  {
    id: 3,
    name: "Himalayan Adventure",
    image: "/placeholder-5y9lu.png",
    budget: "₹55,000",
    duration: "10 Days",
    rating: 4.7,
    description: "Breathtaking mountain views and adventure activities",
    highlights: ["Manali Valley", "Rohtang Pass", "Solang Valley"],
  },
  {
    id: 4,
    name: "Goa Beach Retreat",
    image: "/goa-sunset-palms.png",
    budget: "₹25,000",
    duration: "4 Days",
    rating: 4.6,
    description: "Relax on pristine beaches with vibrant nightlife",
    highlights: ["Baga Beach", "Old Goa Churches", "Spice Plantations"],
  },
  {
    id: 5,
    name: "Golden Triangle",
    image: "/taj-mahal-golden-hour.png",
    budget: "₹40,000",
    duration: "6 Days",
    rating: 4.8,
    description: "Classic India tour covering Delhi, Agra, and Jaipur",
    highlights: ["Taj Mahal", "Red Fort", "Amber Palace"],
  },
]

export default function Recommendations({ userData }: RecommendationsProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % recommendedTrips.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + recommendedTrips.length) % recommendedTrips.length)
  }

  const handleViewTrip = (tripId: number) => {
    alert(`Navigating to trip ${tripId} in the main dashboard!`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500 flex items-center justify-center p-8">
        <div className="bg-white border-4 border-black p-8 text-center max-w-md">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <Sparkles className="w-16 h-16 text-black" />
          </motion.div>
          <h2 className="text-2xl font-black text-black mb-3 uppercase">Crafting Your Perfect Journey</h2>
          <p className="text-black font-medium">
            We're analyzing your travel preferences to recommend amazing destinations...
          </p>
          <div className="mt-6 bg-gray-200 border-2 border-black h-4 overflow-hidden">
            <motion.div
              className="h-full bg-yellow-400 border-r-2 border-black"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
            />
          </div>
        </div>
      </div>
    )
  }

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

      <div className="max-w-6xl mx-auto p-8">
        {/* Header Message */}
        <div className="bg-white border-4 border-black p-6 mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-16 h-16 bg-yellow-400 border-2 border-black flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 text-black" />
          </motion.div>
          <h2 className="text-3xl font-black text-black mb-3 uppercase">Your Personalized Recommendations</h2>
          <p className="text-black font-medium">
            Based on your travel history and preferences, here are some amazing trips for you
          </p>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden border-4 border-black mb-8">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {recommendedTrips.map((trip, index) => (
              <div key={trip.id} className="w-full flex-shrink-0">
                <div className="bg-white overflow-hidden">
                  <div className="relative">
                    <img
                      src={trip.image || "/placeholder.svg"}
                      alt={trip.name}
                      className="w-full h-64 md:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-black text-white mb-2 uppercase">{trip.name}</h3>
                      <p className="text-white font-medium text-sm">{trip.description}</p>
                    </div>
                    <div className="absolute top-4 right-4 bg-yellow-400 border-2 border-black px-3 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 text-black fill-current" />
                      <span className="text-black font-bold text-sm">{trip.rating}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-black font-bold">
                          <DollarSign className="w-4 h-4" />
                          <span>{trip.budget}</span>
                        </div>
                        <div className="flex items-center gap-1 text-black font-bold">
                          <Clock className="w-4 h-4" />
                          <span>{trip.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-black text-black mb-2 uppercase">Trip Highlights</h4>
                      <div className="space-y-1">
                        {trip.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-black font-medium">
                            <MapPin className="w-3 h-3 text-black" />
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleViewTrip(trip.id)}
                      className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black"
                    >
                      VIEW TRIP DETAILS
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180 text-black" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-black" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {recommendedTrips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 border border-white transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white border-4 border-black p-6 text-center"
        >
          <h3 className="text-xl font-black text-black mb-2 uppercase">
            Welcome to GlobeTrotter, {userData.email?.split("@")[0] || "Explorer"}! 🎉
          </h3>
          <p className="text-black font-medium">
            Your personalized travel dashboard is ready. Start exploring these handpicked destinations based on your
            preferences!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
