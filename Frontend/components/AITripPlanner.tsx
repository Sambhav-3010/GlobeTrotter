"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Sparkles,
  Plus,
  Save,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Share2,
  Edit3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AITripPlannerProps {
  onBack: () => void
}

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface GeneratedItinerary {
  id: string
  title: string
  destination: string
  duration: string
  budget: string
  days: {
    day: number
    title: string
    activities: string[]
    meals: string[]
    accommodation?: string
  }[]
  flights: {
    departure: string
    arrival: string
    price: string
  }[]
  places: string[]
  activities: string[]
  dining: string[]
}

const sampleItineraries: GeneratedItinerary[] = [
  {
    id: "1",
    title: "Magical Rajasthan Adventure",
    destination: "Rajasthan, India",
    duration: "7 Days",
    budget: "₹45,000",
    days: [
      {
        day: 1,
        title: "Arrival in Jaipur - The Pink City",
        activities: ["City Palace visit", "Hawa Mahal photography", "Local market exploration"],
        meals: ["Welcome dinner at Chokhi Dhani", "Traditional Rajasthani thali"],
        accommodation: "Heritage hotel in old city",
      },
      {
        day: 2,
        title: "Jaipur Forts and Palaces",
        activities: ["Amber Fort", "Jaigarh Fort", "Nahargarh Fort sunset"],
        meals: ["Breakfast at hotel", "Lunch at Amber Fort", "Dinner at rooftop restaurant"],
      },
      {
        day: 3,
        title: "Journey to Udaipur",
        activities: ["Travel to Udaipur", "City Palace complex", "Lake Pichola boat ride"],
        meals: ["Breakfast", "Lunch en route", "Dinner with lake view"],
      },
    ],
    flights: [
      { departure: "Delhi (DEL)", arrival: "Jaipur (JAI)", price: "₹3,500" },
      { departure: "Udaipur (UDR)", arrival: "Delhi (DEL)", price: "₹4,200" },
    ],
    places: ["City Palace Jaipur", "Hawa Mahal", "Amber Fort", "Lake Pichola", "Jagdish Temple"],
    activities: ["Fort exploration", "Boat rides", "Cultural shows", "Shopping", "Photography"],
    dining: ["Chokhi Dhani", "Ambrai Restaurant", "Millets of Mewar", "Jagat Niwas Palace"],
  },
]

export default function AITripPlanner({ onBack }: AITripPlannerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your AI travel assistant. Tell me about your dream trip - where would you like to go, when, what's your budget, and what kind of experience are you looking for?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [generatedItineraries, setGeneratedItineraries] = useState<GeneratedItinerary[]>([])
  const [selectedItinerary, setSelectedItinerary] = useState<GeneratedItinerary | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [tripName, setTripName] = useState("")
  const [showCollabDialog, setShowCollabDialog] = useState(false)
  const [collaboratorEmail, setCollaboratorEmail] = useState("")
  const [collaboratorRole, setCollaboratorRole] = useState<"editor" | "tag-along">("editor")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Based on your preferences, I've created some amazing itineraries for you! Let me generate detailed plans with day-by-day activities, accommodations, and budget breakdowns.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)

      // Generate itineraries
      setTimeout(() => {
        setGeneratedItineraries(sampleItineraries)
      }, 1000)
    }, 2000)
  }

  const handleSaveTrip = () => {
    if (!tripName.trim() || !selectedItinerary) return

    console.log("Saving trip:", tripName, selectedItinerary)
    setShowSaveDialog(false)
    setTripName("")

    const successMessage: Message = {
      id: Date.now().toString(),
      type: "ai",
      content: `Great! I've saved "${tripName}" to your trips. You can now edit, collaborate, and customize it further.`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, successMessage])
  }

  const handleInviteCollaborator = () => {
    if (!collaboratorEmail.trim()) return

    console.log("Inviting collaborator:", collaboratorEmail, collaboratorRole)
    setShowCollabDialog(false)
    setCollaboratorEmail("")

    const successMessage: Message = {
      id: Date.now().toString(),
      type: "ai",
      content: `Invitation sent to ${collaboratorEmail} as ${collaboratorRole}. They'll receive an email to join your trip planning.`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, successMessage])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* Header */}
      <div className="bg-black p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              BACK
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 border-2 border-white flex items-center justify-center">
                <Bot className="w-4 h-4 text-black" />
              </div>
              <h1 className="text-xl font-bold text-white uppercase">AI Trip Planner</h1>
            </div>
          </div>

          {selectedItinerary && (
            <div className="flex items-center gap-2">
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
                      className="border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold placeholder:text-gray-500 placeholder:font-bold uppercase"
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
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          {/* Chat Interface */}
          <div className="flex flex-col">
            <div className="flex-1 bg-white border-4 border-black overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-300px)]">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.type === "ai" && (
                      <div className="w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-4 border-2 border-black ${
                        message.type === "user" ? "bg-red-500 text-white" : "bg-gray-100 text-black"
                      }`}
                    >
                      <p className="text-sm font-medium">{message.content}</p>
                    </div>
                    {message.type === "user" && (
                      <div className="w-8 h-8 bg-red-500 border-2 border-black flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center">
                      <Bot className="w-4 h-4 text-black" />
                    </div>
                    <div className="bg-gray-100 border-2 border-black p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-black rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-black rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 border-t-2 border-black">
                <div className="flex gap-3">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="DESCRIBE YOUR DREAM TRIP..."
                    className="flex-1 min-h-[60px] border-2 border-black focus:border-red-500 focus:ring-0 resize-none text-black font-medium placeholder:text-gray-500 placeholder:font-bold"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black px-6"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Itineraries */}
          <div className="flex flex-col">
            <div className="flex-1 bg-white border-4 border-black overflow-hidden">
              {generatedItineraries.length > 0 ? (
                <div className="h-full flex flex-col">
                  <div className="p-6 border-b-2 border-black">
                    <h3 className="text-lg font-black text-black flex items-center gap-2 uppercase">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Generated Itineraries
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {generatedItineraries.map((itinerary) => (
                      <motion.div
                        key={itinerary.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 last:mb-0"
                      >
                        <div className="bg-gray-50 border-2 border-black p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-black text-black mb-2 uppercase">{itinerary.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-black font-bold">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {itinerary.destination}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {itinerary.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {itinerary.budget}
                                </div>
                              </div>
                            </div>

                            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  onClick={() => setSelectedItinerary(itinerary)}
                                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-black"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  ADD TO MY TRIPS
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white border-4 border-black">
                                <DialogHeader>
                                  <DialogTitle className="text-black font-bold uppercase">Save Trip</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input
                                    placeholder="ENTER TRIP NAME"
                                    value={tripName}
                                    onChange={(e) => setTripName(e.target.value)}
                                    className="border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold placeholder:text-gray-500 placeholder:font-bold"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => setShowSaveDialog(false)}
                                      className="flex-1 bg-white hover:bg-gray-50 text-black font-bold border-2 border-black"
                                    >
                                      CANCEL
                                    </Button>
                                    <Button
                                      onClick={handleSaveTrip}
                                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black"
                                    >
                                      <Save className="w-4 h-4 mr-2" />
                                      SAVE TRIP
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>

                          <Tabs defaultValue="full-plan" className="w-full">
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
                              <TabsTrigger value="activities" className="font-bold">
                                ACTIVITIES
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="full-plan" className="mt-4 space-y-4">
                              {itinerary.days.map((day) => (
                                <div key={day.day} className="bg-white border-2 border-black p-4">
                                  <h5 className="font-black text-black mb-2 uppercase">
                                    Day {day.day}: {day.title}
                                  </h5>
                                  <div className="space-y-2 text-sm text-black">
                                    <div>
                                      <strong className="font-bold">ACTIVITIES:</strong> {day.activities.join(", ")}
                                    </div>
                                    <div>
                                      <strong className="font-bold">MEALS:</strong> {day.meals.join(", ")}
                                    </div>
                                    {day.accommodation && (
                                      <div>
                                        <strong className="font-bold">STAY:</strong> {day.accommodation}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </TabsContent>

                            <TabsContent value="travel" className="mt-4 space-y-3">
                              {itinerary.flights.map((flight, index) => (
                                <div key={index} className="bg-white border-2 border-black p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm text-black font-bold">
                                      {flight.departure} → {flight.arrival}
                                    </div>
                                    <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold">
                                      {flight.price}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </TabsContent>

                            <TabsContent value="places" className="mt-4">
                              <div className="flex flex-wrap gap-2">
                                {itinerary.places.map((place, index) => (
                                  <div
                                    key={index}
                                    className="bg-white border-2 border-black px-3 py-1 text-sm font-bold"
                                  >
                                    {place}
                                  </div>
                                ))}
                              </div>
                            </TabsContent>

                            <TabsContent value="activities" className="mt-4">
                              <div className="flex flex-wrap gap-2">
                                {itinerary.activities.map((activity, index) => (
                                  <div
                                    key={index}
                                    className="bg-white border-2 border-black px-3 py-1 text-sm font-bold"
                                  >
                                    {activity}
                                  </div>
                                ))}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 text-black mx-auto mb-4" />
                    <p className="text-black font-bold uppercase">Your AI-generated itineraries will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
