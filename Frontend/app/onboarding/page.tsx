"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, ArrowRight, ArrowLeft, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "../context/UserContext"
import { useAlert } from "../context/AlertContext";

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
  const pathname = usePathname()
  const { user, setUser } = useUser()
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    f_name: user?.f_name || "",
    l_name: user?.l_name || "",
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    gender: user?.gender || "",
    age: user?.age ? String(user.age) : "",
    city: user?.city || "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to track submission

  useEffect(() => {
    const onboardingRequired = localStorage.getItem('onboardingRequired');
    const travelHistoryRequired = localStorage.getItem('travelHistoryRequired');

    if (!user) {
      router.push("/auth");
    } else if (
      !isSubmitting && // Only redirect if not currently submitting
      pathname === "/onboarding" &&
      onboardingRequired !== 'true' &&
      travelHistoryRequired !== 'true' && // Also check travelHistoryRequired
      user.username &&
      user.age &&
      user.city &&
      user.phoneNumber
    ) {
      router.push("/dashboard");
    }
  }, [router, user, pathname, isSubmitting]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        f_name: user.f_name || "",
        l_name: user.l_name || "",
        email: user.email || "",
        username: user.username || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "",
        age: user.age ? String(user.age) : "",
        city: user.city || "",
      }));
    }
  }, [user]);

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
    if (Object.keys(newErrors).length > 0) {
      showAlert(Object.values(newErrors).join("\n"), "destructive", "Validation Error");
      return false;
    }
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setIsSubmitting(true); // Set submitting flag to true
    setErrors({})

    try {
      const userId = user?._id

      if (!userId) {
        showAlert("Authentication token or user ID missing.", "destructive");
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile-details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username,
          age: Number.parseInt(formData.age),
          city: formData.city,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
        }),
      });

      const data = await response.json()

      if (response.ok) {
        setUser(data.user);
        localStorage.removeItem('onboardingRequired'); // Clear the flag after successful onboarding
        localStorage.setItem('travelHistoryRequired', 'true'); // Set travelHistoryRequired
        router.push("/travel-history");
      } else {
        showAlert(data.message || "Failed to update profile.", "destructive");
      }
    } catch (error: any) {
      showAlert(error.message || "Network error. Please try again.", "destructive");
    } finally {
      setLoading(false);
      setIsSubmitting(false); // Reset submitting flag
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-white text-2xl font-bold">GhumoFiro</div>
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
          <div className="bg-white border-4 border-black p-6 mb-8 text-center">
            <h2 className="text-3xl font-black text-black mb-3 uppercase">TELL US ABOUT YOURSELF</h2>
            <p className="text-black font-medium">Help us personalize your travel experience</p>
          </div>

          <div className="bg-white border-4 border-black p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="f_name" className="text-black font-bold text-sm uppercase tracking-wide">
                    First Name
                  </Label>
                  <Input
                    id="f_name"
                    disabled
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
                    disabled
                    type="text"
                    value={formData.l_name}
                    readOnly
                    className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-black font-bold text-sm uppercase tracking-wide">
                  Email Address
                </Label>
                <Input
                  id="email"
                  disabled
                  type="email"
                  value={formData.email}
                  readOnly
                  className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium bg-gray-100 cursor-not-allowed"
                />
              </div>

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

              <div>
                <Label htmlFor="mobile" className="text-black font-bold text-sm uppercase tracking-wide">
                  Mobile Number
                </Label>
                <div className="relative mt-2">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black font-bold">+91</div>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="pl-12 h-12 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
                {errors.phoneNumber && <p className="text-red-600 text-sm mt-1 font-medium">{errors.phoneNumber}</p>}
              </div>

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



              {errors.api && <p className="text-red-600 text-sm mt-1 font-medium text-center">{errors.api}</p>}

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
