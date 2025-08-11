"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, ArrowRight, ArrowLeft, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProfileDetailsProps {
  userData: any
  updateUserData: (data: any) => void
  nextStep: () => void
  prevStep: () => void
}

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

export default function ProfileDetails({ userData, updateUserData, nextStep, prevStep }: ProfileDetailsProps) {
  const [formData, setFormData] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    mobile: userData.mobile || "",
    gender: userData.gender || "",
    age: userData.age || "",
    city: userData.city || "",
    profilePhoto: userData.profilePhoto || null,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(userData.profilePhoto || null)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required"
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid Indian mobile number"
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      updateUserData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        gender: formData.gender,
        age: Number.parseInt(formData.age),
        city: formData.city,
        profilePhoto: formData.profilePhoto,
      })
      nextStep()
    }
  }

  const handleInputChange = (field: string, value: string) => {
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
    if (formData.firstName && formData.lastName) {
      updateUserData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile || "",
        gender: formData.gender || "",
        age: formData.age ? Number.parseInt(formData.age) : 0,
        city: formData.city || "",
        profilePhoto: formData.profilePhoto,
      })
      nextStep()
    }
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

              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-black font-bold text-sm uppercase tracking-wide">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <p className="text-red-600 text-sm mt-1 font-medium">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-black font-bold text-sm uppercase tracking-wide">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="h-12 mt-2 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <p className="text-red-600 text-sm mt-1 font-medium">{errors.lastName}</p>}
                </div>
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

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  onClick={prevStep}
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
                >
                  CONTINUE
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
