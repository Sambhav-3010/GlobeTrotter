"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plane, Sun, Moon, User, LogOut, Zap, MapPin, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "../providers/theme-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const trendingDestinations = [
  {
    id: 1,
    name: "Magical Rajasthan",
    image: "/rajasthan-palace-sunset.png",
    budget: "45000",
    duration: "7 Days",
    description: "Royal palaces and vibrant culture",
  },
  {
    id: 2,
    name: "Kerala Backwaters",
    image: "/kerala-backwaters-houseboat.png",
    budget: "35000",
    duration: "5 Days",
    description: "Serene houseboat experiences",
  },
  {
    id: 3,
    name: "Himalayan Adventure",
    image: "/placeholder.svg?height=300&width=400&text=Himalayan+Mountains",
    budget: "55000",
    duration: "10 Days",
    description: "Breathtaking mountain views",
  },
]

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Load user data from localStorage
    const user = localStorage.getItem("user")
    const onboardingFname = localStorage.getItem("f_name")
    const onboardingLname = localStorage.getItem("l_name")
    const onboardingEmail = localStorage.getItem("email")

    if (user) {
      const userDataParsed = JSON.parse(user)
      setUserData(userDataParsed)
    } else if (onboardingFname && onboardingLname && onboardingEmail) {
      router.push("/onboarding")
    } else {
      router.push("/auth")
    }
  }, [router])

  const handleSignOut = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    localStorage.removeItem("user")
    localStorage.removeItem("f_name")
    localStorage.removeItem("l_name")
    localStorage.removeItem("email")
    localStorage.removeItem("theme")

    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    })

    setTimeout(() => {
      router.push("/auth")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* Header */}
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-white text-2xl font-bold">globetrotter</div>
            <div className="bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded">BETA</div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/profile")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-white"
            >
              <User className="w-4 h-4 mr-2" />
              PROFILE
            </Button>

            <Button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              SIGN OUT
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black p-6 mb-8"
        >
          <p className="text-black font-medium text-xl">
            Ready to explore the world? Where wanderlust meets adventure, and journeys go beyond the ordinary!
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-yellow-400 border-4 border-black p-4 text-center mb-8">
            <p className="text-black font-bold text-lg uppercase tracking-wide">PACK YOUR BAGS, EXPLORE THE WORLD!!!</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Side - Main Heading */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <h1 className="text-6xl lg:text-8xl font-black text-black mb-6 leading-none">
              FIND YOUR
              <br />
              PERFECT TRIP <Zap className="inline w-16 h-16 text-yellow-400" />
            </h1>

            <div className="bg-white border-4 border-black p-6 mb-8">
              <p className="text-black font-medium text-lg">
                Ready to flip the script on traveling? Where adventure meets discovery, and connections go beyond the
                journey!
              </p>
            </div>

            {/* Welcome with Profile */}
            {userData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white border-4 border-black p-4 mb-6"
              >
                <div className="flex items-center gap-3">
                  {userData.profilePhoto && (
                    <img
                      src={userData.profilePhoto || "/placeholder.svg"}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-black"
                    />
                  )}
                  <p className="text-black font-bold text-lg">Welcome back, {userData.f_name || "Explorer"}! 🎉</p>
                </div>
              </motion.div>
            )}

            {/* App Store Button */}
            <div className="flex items-center gap-4">
              <div className="bg-black text-white px-6 py-3 font-bold border-2 border-black">
                <Plane className="inline w-5 h-5 mr-2" />
                Download on the App Store
              </div>
              <div className="bg-white border-4 border-black px-4 py-2">
                <p className="text-black font-medium">
                  Email us at <span className="text-red-600 font-bold">support@globetrotter.com</span> to get early
                  access on Android
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Action Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="bg-white border-4 border-black p-6">
              <Button
                onClick={() => router.push("/ai-trip-planner")}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg h-16 border-2 border-black"
              >
                <Bot className="w-6 h-6 mr-3" />
                AI TRIP PLANNER →
              </Button>
            </div>

            <div className="bg-white border-4 border-black p-6">
              <Button
                onClick={() => router.push("/manual-itinerary-builder/setup")}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg h-16 border-2 border-black"
              >
                <MapPin className="w-6 h-6 mr-3" />
                MANUAL TRIP BUILDER →
              </Button>
            </div>

            <div className="bg-white border-4 border-black p-6">
              <div className="text-black font-bold text-lg mb-2 uppercase tracking-wide">TRENDING DESTINATIONS →</div>
              <div className="space-y-2">
                {trendingDestinations.map((dest) => (
                  <div key={dest.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div>
                      <div className="font-bold text-black">{dest.name}</div>
                      <div className="text-sm text-gray-600">{dest.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-black">{dest.budget}</div>
                      <div className="text-sm text-gray-600">{dest.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl font-black text-white mb-6">NEED HELP OR SUPPORT?</h2>
          <div className="bg-white border-4 border-black p-6 max-w-2xl mx-auto">
            <p className="text-black font-medium text-lg">
              Have questions about GlobeTrotter? Need technical support? We're here to help you plan the perfect
              adventure!
            </p>
          </div>
        </motion.div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 mt-8">
          <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center">
            <span className="text-black font-bold">T</span>
          </div>
          <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center">
            <span className="text-black font-bold">I</span>
          </div>
          <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center">
            <span className="text-black font-bold">L</span>
          </div>
        </div>
      </div>
    </div>
  )
}
