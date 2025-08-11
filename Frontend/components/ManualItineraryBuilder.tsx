"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Plus,
  Search,
  Plane,
  Hotel,
  Camera,
  Utensils,
  Share2,
  Edit3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ManualItineraryBuilderProps {
  onBack: () => void
}

interface TripDetails {
  budget: string
  tripType: string
  destination: string
  startDate: string
  endDate: string
}

interface TimelineItem {
  id: string
  type: "flight" | "hotel" | "activity" | "dining"
  title: string
  description: string
  time: string
  date: string
  price?: string
}

const tripTypes = [
  "Business",
  "Friends",
  "Solo",
  "Couple",
  "Honeymoon",
  "Family",
  "Adventure",
  "Relaxation",
  "Cultural",
  "Wildlife",
]

const sampleSearchResults = {
  flights: [
    { id: "f1", title: "Delhi to Goa", description: "IndiGo 6E-173", price: "₹4,500", duration: "2h 30m" },
    { id: "f2", title: "Mumbai to Goa", description: "Air India AI-631", price: "₹3,800", duration: "1h 45m" },
  ],
  hotels: [
    {
      id: "h1",
      title: "Taj Exotica Resort & Spa",
      description: "5-star beachfront resort",
      price: "₹12,000/night",
      rating: "4.8",
    },
    { id: "h2", title: "The Leela Goa", description: "Luxury beach resort", price: "₹15,000/night", rating: "4.9" },
  ],
  activities: [
    {
      id: "a1",
      title: "Dudhsagar Falls Trek",
      description: "Full day adventure trek",
      price: "₹2,500",
      duration: "8 hours",
    },
    { id: "a2", title: "Sunset Cruise", description: "Mandovi River cruise", price: "₹1,200", duration: "2 hours" },
  ],
  dining: [
    {
      id: "d1",
      title: "Thalassa",
      description: "Greek restaurant with sea view",
      price: "₹2,000 for 2",
      cuisine: "Greek",
    },
    {
      id: "d2",
      title: "Fisherman's Wharf",
      description: "Seafood restaurant",
      price: "₹1,500 for 2",
      cuisine: "Seafood",
    },
  ],
}

export default function ManualItineraryBuilder({ onBack }: ManualItineraryBuilderProps) {
  const [step, setStep] = useState<"details" | "builder">("details")
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    budget: "",
    tripType: "",
    destination: "",
    startDate: "",
    endDate: "",
  })
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchCategory, setSearchCategory] = useState<"flights" | "hotels" | "activities" | "dining">("activities")
  const [showCollabDialog, setShowCollabDialog] = useState(false)
  const [collaboratorEmail, setCollaboratorEmail] = useState("")
  const [collaboratorRole, setCollaboratorRole] = useState<"editor" | "tag-along">("editor")

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      tripDetails.budget &&
      tripDetails.tripType &&
      tripDetails.destination &&
      tripDetails.startDate &&
      tripDetails.endDate
    ) {
      setStep("builder")
    }
  }

  const addToTimeline = (item: any, type: string) => {
    const timelineItem: TimelineItem = {
      id: Date.now().toString(),
      type: type as any,
      title: item.title,
      description: item.description,
      time: "09:00",
      date: tripDetails.startDate,
      price: item.price,
    }
    setTimeline((prev) => [...prev, timelineItem])
  }

  const removeFromTimeline = (id: string) => {
    setTimeline((prev) => prev.filter((item) => item.id !== id))
  }

  const handleInviteCollaborator = () => {
    if (!collaboratorEmail.trim()) return

    console.log("Inviting collaborator:", collaboratorEmail, collaboratorRole)
    setShowCollabDialog(false)
    setCollaboratorEmail("")
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="w-4 h-4" />
      case "hotel":
        return <Hotel className="w-4 h-4" />
      case "activity":
        return <Camera className="w-4 h-4" />
      case "dining":
        return <Utensils className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  if (step === "details") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
        {/* Header */}
        <div className="bg-black p-4">
          <div className="max-w-6xl mx-auto flex items-center">
            <Button
              onClick={onBack}
              className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              BACK
            </Button>
            <div className="flex items-center gap-2">
              <div className="text-white text-2xl font-bold">globetrotter</div>
              <div className="bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded">BETA</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
            {/* Header Message */}
            <div className="bg-white border-4 border-black p-6 mb-8 text-center">
              <h1 className="text-3xl font-black text-black mb-3 uppercase">PLAN YOUR TRIP</h1>
              <p className="text-black font-medium">Let's get started with the basics</p>
            </div>

            <div className="bg-white border-4 border-black p-8">
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-black font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Budget
                    </Label>
                    <Select
                      value={tripDetails.budget}
                      onValueChange={(value) => setTripDetails((prev) => ({ ...prev, budget: value }))}
                    >
                      <SelectTrigger className="mt-2 h-12 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold">
                        <SelectValue placeholder="SELECT YOUR BUDGET" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">BUDGET (₹10,000 - ₹25,000)</SelectItem>
                        <SelectItem value="mid-range">MID-RANGE (₹25,000 - ₹50,000)</SelectItem>
                        <SelectItem value="luxury">LUXURY (₹50,000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-black font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Type of Trip
                    </Label>
                    <Select
                      value={tripDetails.tripType}
                      onValueChange={(value) => setTripDetails((prev) => ({ ...prev, tripType: value }))}
                    >
                      <SelectTrigger className="mt-2 h-12 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold">
                        <SelectValue placeholder="SELECT TRIP TYPE" />
                      </SelectTrigger>
                      <SelectContent>
                        {tripTypes.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase()}>
                            {type.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-black font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Main Destination
                  </Label>
                  <Input
                    value={tripDetails.destination}
                    onChange={(e) => setTripDetails((prev) => ({ ...prev, destination: e.target.value }))}
                    className="mt-2 h-12 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold placeholder:text-gray-500 placeholder:font-bold"
                    placeholder="WHERE DO YOU WANT TO GO?"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-black font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={tripDetails.startDate}
                      onChange={(e) => setTripDetails((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="mt-2 h-12 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold"
                    />
                  </div>

                  <div>
                    <Label className="text-black font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={tripDetails.endDate}
                      onChange={(e) => setTripDetails((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="mt-2 h-12 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black"
                >
                  START BUILDING ITINERARY
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* Header */}
      <div className="bg-black p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setStep("details")}
              className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              BACK
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white uppercase">{tripDetails.destination}</h1>
              <p className="text-sm text-white font-medium">
                {tripDetails.startDate} to {tripDetails.endDate} • {tripDetails.tripType.toUpperCase()} •{" "}
                {tripDetails.budget.toUpperCase()}
              </p>
            </div>
          </div>

          <Dialog open={showCollabDialog} onOpenChange={setShowCollabDialog}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-white">
                <Share2 className="w-4 h-4 mr-2" />
                COLLABORATE
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-4 border-black">
              <DialogHeader>
                <DialogTitle className="text-black font-bold uppercase">Invite Collaborators</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="ENTER EMAIL ADDRESS"
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                  className="border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold placeholder:text-gray-500 placeholder:font-bold"
                />
                <div className="flex gap-2">
                  <Button
                    variant={collaboratorRole === "editor" ? "default" : "outline"}
                    onClick={() => setCollaboratorRole("editor")}
                    className="flex-1 border-2 border-black font-bold"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    EDITOR
                  </Button>
                  <Button
                    variant={collaboratorRole === "tag-along" ? "default" : "outline"}
                    onClick={() => setCollaboratorRole("tag-along")}
                    className="flex-1 border-2 border-black font-bold"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    TAG ALONG
                  </Button>
                </div>
                <Button
                  onClick={handleInviteCollaborator}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black"
                >
                  SEND INVITATION
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Search & Add Items */}
          <div className="space-y-6">
            <div className="bg-white border-4 border-black p-6">
              <h3 className="text-lg font-black text-black mb-4 uppercase">Add to Your Trip</h3>

              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                  <Input
                    placeholder={`SEARCH ${searchCategory.toUpperCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold placeholder:text-gray-500 placeholder:font-bold"
                  />
                </div>
                <Select value={searchCategory} onValueChange={(value: any) => setSearchCategory(value)}>
                  <SelectTrigger className="w-32 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flights">FLIGHTS</SelectItem>
                    <SelectItem value="hotels">HOTELS</SelectItem>
                    <SelectItem value="activities">ACTIVITIES</SelectItem>
                    <SelectItem value="dining">DINING</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sampleSearchResults[searchCategory].map((item: any) => (
                  <div key={item.id} className="bg-gray-50 border-2 border-black p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getIconForType(searchCategory.slice(0, -1))}
                          <h4 className="font-black text-black uppercase">{item.title}</h4>
                        </div>
                        <p className="text-sm text-black font-medium mb-2">{item.description}</p>
                        <div className="flex items-center gap-4 text-xs text-black font-bold">
                          {item.price && <span>{item.price}</span>}
                          {item.duration && <span>{item.duration}</span>}
                          {item.rating && <span>⭐ {item.rating}</span>}
                          {item.cuisine && <span>{item.cuisine}</span>}
                        </div>
                      </div>
                      <Button
                        onClick={() => addToTimeline(item, searchCategory.slice(0, -1))}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-black"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border-4 border-black overflow-hidden">
            <Tabs defaultValue="full-plan" className="h-full flex flex-col">
              <div className="p-6 border-b-2 border-black">
                <TabsList className="grid w-full grid-cols-4 bg-gray-200 border-2 border-black">
                  <TabsTrigger value="full-plan" className="font-bold">
                    FULL PLAN
                  </TabsTrigger>
                  <TabsTrigger value="travel" className="font-bold">
                    TRAVEL
                  </TabsTrigger>
                  <TabsTrigger value="places" className="font-bold">
                    PLACES
                  </TabsTrigger>
                  <TabsTrigger value="dining" className="font-bold">
                    DINING
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="full-plan" className="flex-1 p-6 overflow-y-auto">
                {timeline.length > 0 ? (
                  <div className="space-y-4">
                    {timeline.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 border-2 border-black p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 bg-red-500 border-2 border-black flex items-center justify-center flex-shrink-0">
                              {getIconForType(item.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-black text-black uppercase">{item.title}</h4>
                              <p className="text-sm text-black font-medium mb-2">{item.description}</p>
                              <div className="flex items-center gap-4 text-xs text-black font-bold">
                                <span>{item.date}</span>
                                <span>{item.time}</span>
                                {item.price && (
                                  <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold">
                                    {item.price}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => removeFromTimeline(item.id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black w-8 h-8 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-black mx-auto mb-4" />
                      <p className="text-black font-bold uppercase">
                        Start building your itinerary by adding items from the search panel
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="travel" className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {timeline
                    .filter((item) => item.type === "flight")
                    .map((item) => (
                      <div key={item.id} className="bg-gray-50 border-2 border-black p-4">
                        <div className="flex items-center gap-3">
                          <Plane className="w-5 h-5 text-black" />
                          <div className="flex-1">
                            <h4 className="font-black text-black uppercase">{item.title}</h4>
                            <p className="text-sm text-black font-medium">{item.description}</p>
                          </div>
                          {item.price && (
                            <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold">
                              {item.price}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="places" className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {timeline
                    .filter((item) => item.type === "activity")
                    .map((item) => (
                      <div key={item.id} className="bg-gray-50 border-2 border-black p-4">
                        <div className="flex items-center gap-3">
                          <Camera className="w-5 h-5 text-black" />
                          <div className="flex-1">
                            <h4 className="font-black text-black uppercase">{item.title}</h4>
                            <p className="text-sm text-black font-medium">{item.description}</p>
                          </div>
                          {item.price && (
                            <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold">
                              {item.price}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="dining" className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {timeline
                    .filter((item) => item.type === "dining")
                    .map((item) => (
                      <div key={item.id} className="bg-gray-50 border-2 border-black p-4">
                        <div className="flex items-center gap-3">
                          <Utensils className="w-5 h-5 text-black" />
                          <div className="flex-1">
                            <h4 className="font-black text-black uppercase">{item.title}</h4>
                            <p className="text-sm text-black font-medium">{item.description}</p>
                          </div>
                          {item.price && (
                            <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold">
                              {item.price}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
