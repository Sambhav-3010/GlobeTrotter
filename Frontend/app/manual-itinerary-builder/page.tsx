"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Plane, Hotel, Camera, Utensils, ArrowRight, DollarSign } from "lucide-react"
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

const steps = [
  {
    id: "travel",
    title: "TRAVEL",
    description: "Choose flights and trains",
    icon: Plane,
    route: "/manual-itinerary-builder/travel",
    color: "bg-blue-500",
  },
  {
    id: "hotels",
    title: "HOTELS",
    description: "Select accommodations",
    icon: Hotel,
    route: "/manual-itinerary-builder/hotels",
    color: "bg-green-500",
  },
  {
    id: "activities",
    title: "ACTIVITIES",
    description: "Plan your adventures",
    icon: Camera,
    route: "/manual-itinerary-builder/activities",
    color: "bg-purple-500",
  },
  {
    id: "dining",
    title: "DINING",
    description: "Find restaurants",
    icon: Utensils,
    route: "/manual-itinerary-builder/dining",
    color: "bg-orange-500",
  },
]

export default function ManualItineraryBuilderPage() {
  const router = useRouter()
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    // Load trip details and progress from localStorage
    const savedDetails = localStorage.getItem("globetrotter-trip-details")
    const savedProgress = localStorage.getItem("globetrotter-trip-progress")

    if (savedDetails) {
      setTripDetails(JSON.parse(savedDetails))
    } else {
      // Redirect to setup if no trip details
      router.push("/manual-itinerary-builder/setup")
      return
    }

    if (savedProgress) {
      setCompletedSteps(JSON.parse(savedProgress))
    }
  }, [router])

  const handleStepClick = (route: string) => {
    router.push(route)
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  const getBudgetStatus = () => {
    if (!tripDetails) return { color: "text-gray-500", message: "Loading..." }

    const budget = Number.parseFloat(tripDetails.budget)
    const spent = tripDetails.totalSpent || 0
    const remaining = budget - spent
    const percentage = (spent / budget) * 100

    if (percentage >= 100) {
      return { color: "text-red-500", message: "BUDGET EXCEEDED!" }
    } else if (percentage >= 80) {
      return { color: "text-orange-500", message: "BUDGET WARNING" }
    } else {
      return { color: "text-green-500", message: "WITHIN BUDGET" }
    }
  }

  if (!tripDetails) {
    return <div>Loading...</div>
  }

  const budgetStatus = getBudgetStatus()
  const remainingBudget = Number.parseFloat(tripDetails.budget) - (tripDetails.totalSpent || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* Header */}
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
            <div className="text-white text-2xl font-bold">MANUAL TRIP BUILDER</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Trip Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black p-6 mb-8"
        >
          <h2 className="text-2xl font-black text-black mb-4 uppercase">Your Trip Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-black font-bold">DESTINATION: {tripDetails.destination}</p>
              <p className="text-black font-bold">DURATION: {tripDetails.duration} DAYS</p>
            </div>
            <div>
              <p className="text-black font-bold">
                DATES: {tripDetails.startDate} - {tripDetails.endDate}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Budget Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-4 border-black p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black text-black uppercase flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Budget Tracker
            </h3>
            <span className={`font-bold text-lg ${budgetStatus.color}`}>{budgetStatus.message}</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-black font-bold text-lg">TOTAL BUDGET</p>
              <p className="text-2xl font-black text-green-600">${tripDetails.budget}</p>
            </div>
            <div className="text-center">
              <p className="text-black font-bold text-lg">SPENT</p>
              <p className="text-2xl font-black text-red-500">${tripDetails.totalSpent || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-black font-bold text-lg">REMAINING</p>
              <p className={`text-2xl font-black ${remainingBudget >= 0 ? "text-green-600" : "text-red-500"}`}>
                ${remainingBudget.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Budget Progress Bar */}
          <div className="mt-4">
            <div className="bg-gray-200 border-2 border-black h-4">
              <div
                className={`h-full ${
                  (tripDetails.totalSpent || 0) / Number.parseFloat(tripDetails.budget) >= 1
                    ? "bg-red-500"
                    : (tripDetails.totalSpent || 0) / Number.parseFloat(tripDetails.budget) >= 0.8
                      ? "bg-orange-500"
                      : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(((tripDetails.totalSpent || 0) / Number.parseFloat(tripDetails.budget)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Step Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = completedSteps.includes(step.id)

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-4 border-black overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleStepClick(step.route)}
              >
                <div className={`${step.color} p-4 border-b-4 border-black`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-8 h-8 text-white" />
                      <div>
                        <h3 className="text-xl font-black text-white">{step.title}</h3>
                        <p className="text-white font-medium">{step.description}</p>
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded">✓ DONE</div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-black font-medium">
                      {isCompleted ? "Review and modify your selections" : "Start planning this section"}
                    </p>
                    <ArrowRight className="w-5 h-5 text-black" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border-4 border-black p-6 mt-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-black mb-2 uppercase">Progress</h3>
              <p className="text-black font-medium">
                {completedSteps.length} of {steps.length} sections completed
              </p>
            </div>
            <div className="flex gap-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-4 h-4 border-2 border-black ${
                    completedSteps.includes(step.id) ? "bg-yellow-400" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {completedSteps.length === steps.length && (
            <div className="mt-4 pt-4 border-t-2 border-black">
              <Button
                onClick={() => router.push("/manual-itinerary-builder/review")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg h-12 border-2 border-black"
              >
                REVIEW & FINALIZE TRIP →
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}