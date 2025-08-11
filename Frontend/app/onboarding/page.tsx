"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, ArrowRight, ArrowLeft, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useUser } from "../context/UserContext"
import Cookies from "js-cookie"

const indianCities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri-Chinchwad",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Kalyan-Dombivali",
  "Vasai-Virar",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Navi Mumbai",
  "Allahabad",
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, setUser } = useUser()
  const [formData, setFormData] = useState({
    f_name: user?.f_name || "",
    l_name: user?.l_name || "",
    username: user?.username || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    gender: user?.gender || "",
    age: user?.age ? String(user.age) : "",
    city: user?.city || "",
    placesVisited: user?.placesVisited || ([] as string[]),
    profilePhoto: user?.profilePhoto || null,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Pre-fill data from localStorage after signup
    if (!user) {
      router.push("/auth")
    }
  }, [router])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.username) {
      newErrors.username = "Username is required"
    }

    if (!formData.age) {
      newErrors.age = "Age is required"
    } else if (Number.parseInt(formData.age) < 18 || Number.parseInt(formData.age) > 100) {
      newErrors.age = "Age must be between 18 and 100"
    }

    if (!formData.city) {
      newErrors.city = "Please select your city"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const token = Cookies.get("token")
      const userId = user?.id

      if (!token || !userId) {
        setErrors({ api: "Authentication token or user ID missing." })
        setLoading(false)
        return
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          age: Number.parseInt(formData.age),
          city: formData.city,
          phoneNumber: formData.mobile,
          gender: formData.gender,
          placesVisited: formData.placesVisited,
          profilePhoto: formData.profilePhoto,
        }),
      });

      const data = await response.json()

      if (response.ok) {
        setUser(data.user) // Update user context and local storage
        router.push("/dashboard") // Redirect to dashboard after onboarding
      } else {
        setErrors({ api: data.message || "Failed to update profile." })
      }
    } catch (error: any) {
      setErrors({ api: error.message || "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPhotoPreview(result)
        setFormData((prev) => ({ ...prev, profilePhoto: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
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
          <Button
            onClick={() => router.push("/auth")}
            className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Header Message */}
          <div className="bg-white border-4 border-black p-6 mb-8 text-center">
            <h2 className="text-3xl font-black text-black mb-3 uppercase">TELL US ABOUT YOURSELF</h2>
            <p className="text-black font-medium">Help us personalize your travel experience</p>
          </div>

          <div className="bg-white border-4 border-black p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-black bg-gray-100 flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center cursor-pointer">
                    <Camera className="w-4 h-4 text-black" />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <p className="text-black font-bold text-sm mt-2 uppercase">Upload Profile Photo</p>
              </div>

              {/* Name Fields (Read-only) */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="f_name" className="text-black font-bold text-sm uppercase tracking-wide">
                    First Name
                  </Label>
                  <Input
                    id="f_name"
                    type="text"
                    value={formData.f_name}
                    readOnly
                    className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label htmlFor="l_name" className="text-black font-bold text-sm uppercase tracking-wide">
                    Last Name
                  </Label>
                  <Input
                    id="l_name"
                    type="text"
                    value={formData.l_name}
                    readOnly
                    className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <Label htmlFor="email" className="text-black font-bold text-sm uppercase tracking-wide">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username" className="text-black font-bold text-sm uppercase tracking-wide">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                  placeholder="Choose a unique username"
                />
                {errors.username && <p className="text-red-600 text-sm mt-1 font-medium">{errors.username}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <Label htmlFor="mobile" className="text-black font-bold text-sm uppercase tracking-wide">
                  Mobile Number
                </Label>
                <div className="relative mt-2">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black font-bold">+91</div>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                    className="pl-12 h-12 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
                {errors.mobile && <p className="text-red-600 text-sm mt-1 font-medium">{errors.mobile}</p>}
              </div>

              {/* Gender and Age */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-black font-bold text-sm uppercase tracking-wide">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-red-600 text-sm mt-1 font-medium">{errors.gender}</p>}
                </div>

                <div>
                  <Label htmlFor="age" className="text-black font-bold text-sm uppercase tracking-wide">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                    placeholder="Enter your age"
                    min="18"
                    max="100"
                  />
                  {errors.age && <p className="text-red-600 text-sm mt-1 font-medium">{errors.age}</p>}
                </div>
              </div>

              {/* City */}
              <div>
                <Label className="text-black font-bold text-sm uppercase tracking-wide">City of Residence</Label>
                <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                  <SelectTrigger className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {indianCities.map((city) => (
                      <SelectItem key={city} value={city.toLowerCase()}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && <p className="text-red-600 text-sm mt-1 font-medium">{errors.city}</p>}
              </div>

              {/* Places Visited */}
              <div>
                <Label htmlFor="placesVisited" className="text-black font-bold text-sm uppercase tracking-wide">
                  Places Visited (comma-separated)
                </Label>
                <Input
                  id="placesVisited"
                  type="text"
                  value={formData.placesVisited.join(", ")}
                  onChange={(e) => handleInputChange("placesVisited", e.target.value.split(",").map(s => s.trim()))}
                  className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                  placeholder="e.g., Paris, Tokyo, New York"
                />
              </div>

              {errors.api && <p className="text-red-600 text-sm mt-1 font-medium text-center">{errors.api}</p>}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  onClick={() => router.push("/auth")}
                  className="flex-1 h-12 bg-white hover:bg-gray-50 text-black font-bold border-2 border-black"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  BACK
                </Button>
                <Button
                  type="button"
                  onClick={handleSkip}
                  className="h-12 px-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-black"
                >
                  SKIP
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black"
                  disabled={loading}
                >
                  {loading ? "SAVING..." : "CONTINUE"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
