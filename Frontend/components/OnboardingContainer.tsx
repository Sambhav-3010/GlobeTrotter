"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AuthPage from "./AuthPage"
import ProfileDetails from "./ProfileDetails"
import TravelHistory from "./TravelHistory"
import TripDetails from "./TripDetails"
import ProgressBar from "./ProgressBar"

export interface UserData {
  email: string
  mobile: string
  gender: string
  age: number
  city: string
  visitedCities: string[]
  visitedCountries: string[]
  tripDetails: {
    [location: string]: {
      dateRange: { start: string; end: string }
      season: string
      tripType: string[]
    }
  }
}

export default function OnboardingContainer() {
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState<UserData>({
    email: "",
    mobile: "",
    gender: "",
    age: 0,
    city: "",
    visitedCities: [],
    visitedCountries: [],
    tripDetails: {},
  })

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("globetrotter-onboarding")
    const savedStep = localStorage.getItem("globetrotter-step")

    if (savedData) {
      setUserData(JSON.parse(savedData))
    }
    if (savedStep) {
      setCurrentStep(Number.parseInt(savedStep))
    }
  }, [])

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem("globetrotter-onboarding", JSON.stringify(userData))
    localStorage.setItem("globetrotter-step", currentStep.toString())
  }, [userData, currentStep])

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      // Navigate to main dashboard
      window.location.href = "/dashboard"
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateUserData = (data: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...data }))
  }

  const steps = [
    { title: "Welcome", component: AuthPage },
    { title: "Profile", component: ProfileDetails },
    { title: "Travel History", component: TravelHistory },
    { title: "Trip Details", component: TripDetails },
  ]

  const CurrentComponent = steps[currentStep].component

  return (
    <div className="min-h-screen flex flex-col">
      {currentStep > 0 && <ProgressBar currentStep={currentStep} totalSteps={4} steps={steps} />}

      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl"
          >
            <CurrentComponent
              userData={userData}
              updateUserData={updateUserData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
