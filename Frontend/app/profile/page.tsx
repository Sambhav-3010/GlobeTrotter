"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Camera,
  Edit3,
  Trash2,
  Save,
  X,
  Languages,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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
]

const languages = [
  "English",
  "Hindi",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Gujarati",
  "Urdu",
  "Kannada",
  "Malayalam",
]

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    gender: "",
    age: "",
    city: "",
    profilePhoto: null as string | null,
    language: "english",
    visitedCities: [] as string[],
    visitedCountries: [] as string[],
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    // Load user data from localStorage
    const profile = localStorage.getItem("globetrotter-profile")
    const travel = localStorage.getItem("globetrotter-travel")

    if (profile) {
      const profileData = JSON.parse(profile)
      const travelData = travel ? JSON.parse(travel) : { visitedCities: [], visitedCountries: [] }
      const combinedData = { ...profileData, ...travelData }
      setUserData(combinedData)
      setEditData({
        firstName: combinedData.firstName || "",
        lastName: combinedData.lastName || "",
        email: combinedData.email || "",
        mobile: combinedData.mobile || "",
        gender: combinedData.gender || "",
        age: combinedData.age?.toString() || "",
        city: combinedData.city || "",
        profilePhoto: combinedData.profilePhoto || null,
        language: combinedData.language || "english",
        visitedCities: combinedData.visitedCities || [],
        visitedCountries: combinedData.visitedCountries || [],
      })
      setPhotoPreview(combinedData.profilePhoto || null)
    } else {
      router.push("/auth")
    }
  }, [router])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPhotoPreview(result)
        setEditData((prev) => ({ ...prev, profilePhoto: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = () => {
    const updatedProfile = {
      firstName: editData.firstName,
      lastName: editData.lastName,
      email: editData.email,
      mobile: editData.mobile,
      gender: editData.gender,
      age: Number.parseInt(editData.age),
      city: editData.city,
      profilePhoto: editData.profilePhoto,
      language: editData.language,
    }

    const updatedTravel = {
      visitedCities: editData.visitedCities,
      visitedCountries: editData.visitedCountries,
    }

    localStorage.setItem("globetrotter-profile", JSON.stringify(updatedProfile))
    localStorage.setItem("globetrotter-travel", JSON.stringify(updatedTravel))

    setIsEditModalOpen(false)
    toast({
      title: "Profile updated successfully",
      description: "Your changes have been saved.",
    })

    window.location.reload()
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      localStorage.clear()
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
        variant: "destructive",
      })
      setTimeout(() => {
        router.push("/auth")
      }, 1000)
    }
  }

  const totalTrips = (userData?.visitedCities?.length || 0) + (userData?.visitedCountries?.length || 0)

  if (!userData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* Header */}
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              BACK
            </Button>
            <div className="flex items-center gap-2">
              <div className="text-white text-2xl font-bold">MY PROFILE</div>
            </div>
          </div>

          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-white">
                <Edit3 className="w-4 h-4 mr-2" />
                EDIT PROFILE
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-4 border-black">
              <DialogHeader>
                <DialogTitle className="text-black font-bold text-xl uppercase">Edit Profile</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Profile Photo */}
                <div className="flex flex-col items-center">
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
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-black font-bold text-sm uppercase">First Name</Label>
                    <Input
                      value={editData.firstName}
                      onChange={(e) => setEditData((prev) => ({ ...prev, firstName: e.target.value }))}
                      className="border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                    />
                  </div>
                  <div>
                    <Label className="text-black font-bold text-sm uppercase">Last Name</Label>
                    <Input
                      value={editData.lastName}
                      onChange={(e) => setEditData((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-black font-bold text-sm uppercase">Email</Label>
                  <Input
                    value={editData.email}
                    onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                    className="border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                  />
                </div>

                <div>
                  <Label className="text-black font-bold text-sm uppercase">Mobile</Label>
                  <Input
                    value={editData.mobile}
                    onChange={(e) => setEditData((prev) => ({ ...prev, mobile: e.target.value }))}
                    className="border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-black font-bold text-sm uppercase">Gender</Label>
                    <Select
                      value={editData.gender}
                      onValueChange={(value) => setEditData((prev) => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger className="border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-black font-bold text-sm uppercase">Age</Label>
                    <Input
                      type="number"
                      value={editData.age}
                      onChange={(e) => setEditData((prev) => ({ ...prev, age: e.target.value }))}
                      className="border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-black font-bold text-sm uppercase">City</Label>
                    <Select
                      value={editData.city}
                      onValueChange={(value) => setEditData((prev) => ({ ...prev, city: value }))}
                    >
                      <SelectTrigger className="border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {indianCities.map((city) => (
                          <SelectItem key={city} value={city.toLowerCase()}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-black font-bold text-sm uppercase">Language</Label>
                    <Select
                      value={editData.language}
                      onValueChange={(value) => setEditData((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="border-2 border-black focus:border-red-500 focus:ring-0 text-black font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang.toLowerCase()}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-white hover:bg-gray-50 text-black font-bold border-2 border-black"
                  >
                    <X className="w-4 h-4 mr-2" />
                    CANCEL
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    SAVE CHANGES
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-4 border-black p-8 text-center"
            >
              <div className="w-32 h-32 border-4 border-black bg-gray-100 flex items-center justify-center mx-auto mb-6 overflow-hidden">
                {userData?.profilePhoto ? (
                  <img
                    src={userData.profilePhoto || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>

              <h2 className="text-2xl font-black text-black mb-6 uppercase">
                {userData?.firstName} {userData?.lastName}
              </h2>

              <div className="space-y-4 text-black">
                <div className="flex items-center justify-center gap-2 p-2 border-2 border-gray-200">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">{userData?.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 border-2 border-gray-200">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">+91 {userData?.mobile}</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 border-2 border-gray-200">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium capitalize">{userData?.city}</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 border-2 border-gray-200">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{userData?.age} years old</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 border-2 border-gray-200">
                  <Languages className="w-4 h-4" />
                  <span className="text-sm font-medium capitalize">{userData?.language || "English"}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-400 border-2 border-black">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-black" />
                  <span className="font-black text-black uppercase">Travel Stats</span>
                </div>
                <p className="text-3xl font-black text-black">{totalTrips}</p>
                <p className="text-sm font-bold text-black uppercase">Total Trips</p>
              </div>
            </motion.div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Visited Cities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-4 border-black p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-black" />
                <h3 className="text-xl font-black text-black uppercase">Visited Cities in India</h3>
                <div className="bg-yellow-400 border-2 border-black px-3 py-1">
                  <span className="text-black font-bold text-sm">{userData?.visitedCities?.length || 0}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {userData?.visitedCities?.length > 0 ? (
                  userData.visitedCities.map((city: string, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-100 border-2 border-black px-3 py-1 text-black font-bold text-sm uppercase"
                    >
                      {city}
                    </div>
                  ))
                ) : (
                  <p className="text-black font-medium">No cities visited yet</p>
                )}
              </div>
            </motion.div>

            {/* Visited Countries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border-4 border-black p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-black" />
                <h3 className="text-xl font-black text-black uppercase">Visited Countries</h3>
                <div className="bg-yellow-400 border-2 border-black px-3 py-1">
                  <span className="text-black font-bold text-sm">{userData?.visitedCountries?.length || 0}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {userData?.visitedCountries?.length > 0 ? (
                  userData.visitedCountries.map((country: string, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-100 border-2 border-black px-3 py-1 text-black font-bold text-sm uppercase"
                    >
                      {country}
                    </div>
                  ))
                ) : (
                  <p className="text-black font-medium">No countries visited yet</p>
                )}
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-red-100 border-4 border-black p-8"
            >
              <h3 className="text-xl font-black text-red-600 mb-4 uppercase">Danger Zone</h3>
              <p className="text-black font-medium mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-black"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                DELETE ACCOUNT
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
