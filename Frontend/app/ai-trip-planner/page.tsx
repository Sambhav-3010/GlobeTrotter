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
  Utensils,
  Bed,
  Plane,
  Map,
  ListChecks
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

// This interface perfectly matches the detailed JSON schema from the backend
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

const questions = [
    "First, where would you like to go? (e.g., Bali, Indonesia)",
    "Great! When are you planning to travel? (e.g., August 20th to August 27th)",
    "Got it. How many people are traveling?",
    "Perfect. What type of trip is this? (e.g., Friends Trip, Honeymoon, Solo)",
    "And finally, what's your approximate budget per person? (e.g., $1500 USD)"
];

export default function AITripPlannerPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
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

  // State for the conversational questionnaire
  const [conversationStage, setConversationStage] = useState(0);
  const [tripDetails, setTripDetails] = useState({
      destination: "",
      dates: "",
      num_people: "",
      trip_type: "",
      budget: ""
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Ask the first question when the component mounts
  useEffect(() => {
    setMessages([
        {
            id: "1",
            type: "ai",
            content: "Hello! I'm your AI travel assistant. Let's plan your dream trip together.",
            timestamp: new Date(),
        },
        {
            id: "2",
            type: "ai",
            content: questions[0],
            timestamp: new Date(),
        }
    ])
  }, []);

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  const generateFullItinerary = async (details: typeof tripDetails) => {
    setIsTyping(true);
    setGeneratedItineraries([]);

    const finalPrompt = `
        Destination: ${details.destination}
        Travel Dates: ${details.dates}
        Number of People: ${details.num_people}
        Trip Type: ${details.trip_type}
        Budget per Person: ${details.budget}
    `;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate-itinerary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: finalPrompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || `API error: ${response.statusText}`);
        }

        const itineraryData: GeneratedItinerary = await response.json();

        const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: `Excellent! Based on your answers, I've crafted a personalized plan for your trip to ${itineraryData.destination}. Check it out!`,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setGeneratedItineraries([itineraryData]);

    } catch (error: any) {
        console.error("Failed to generate itinerary:", error);
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: `I'm sorry, I encountered an error while creating your itinerary. Please try again later. (Details: ${error.message})`,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsTyping(false);
    }
  }


  const handleSendMessage = async () => {
    if (!inputMessage.trim() || conversationStage >= questions.length) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    
    // Store the answer
    const newTripDetails = { ...tripDetails };
    const detailKeys = ["destination", "dates", "num_people", "trip_type", "budget"];
    newTripDetails[detailKeys[conversationStage]] = currentInput;
    setTripDetails(newTripDetails);

    const nextStage = conversationStage + 1;
    setConversationStage(nextStage);

    // If there are more questions, ask the next one
    if (nextStage < questions.length) {
        const aiQuestion: Message = {
            id: `ai-${nextStage}`,
            type: "ai",
            content: questions[nextStage],
            timestamp: new Date()
        };
        setTimeout(() => setMessages((prev) => [...prev, aiQuestion]), 500);
    } else {
        // All questions answered, generate the itinerary
        generateFullItinerary(newTripDetails);
    }
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
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
            >
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
                      <p className="text-sm font-medium whitespace-pre-wrap">{message.content}</p>
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
                    placeholder="Type your answer here..."
                    className="flex-1 min-h-[60px] border-2 border-black focus:border-red-500 focus:ring-0 resize-none text-black font-medium placeholder:text-gray-500 placeholder:font-bold"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isTyping || conversationStage >= questions.length}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping || conversationStage >= questions.length}
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
                      Generated Itinerary
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
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-black font-bold">
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
                              <TabsTrigger value="full-plan" className="font-bold">FULL PLAN</TabsTrigger>
                              <TabsTrigger value="travel" className="font-bold">TRAVEL</TabsTrigger>
                              <TabsTrigger value="places" className="font-bold">PLACES</TabsTrigger>
                              <TabsTrigger value="activities" className="font-bold">DINING</TabsTrigger>
                            </TabsList>

                            <TabsContent value="full-plan" className="mt-4 space-y-4">
                              {itinerary.days.map((day) => (
                                <div key={day.day} className="bg-white border-2 border-black p-4">
                                  <h5 className="font-black text-black mb-3 uppercase">
                                    Day {day.day}: {day.title}
                                  </h5>
                                  <div className="space-y-3 text-sm text-black">
                                    <div className="flex items-start gap-2">
                                      <ListChecks className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                                      <div><strong className="font-bold">ACTIVITIES:</strong> {day.activities.join(", ")}</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Utensils className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                                      <div><strong className="font-bold">MEALS:</strong> {day.meals.join(", ")}</div>
                                    </div>
                                    {day.accommodation && (
                                      <div className="flex items-start gap-2">
                                        <Bed className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                                        <div><strong className="font-bold">STAY:</strong> {day.accommodation}</div>
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
                                    <div className="text-sm text-black font-bold flex items-center gap-2">
                                      <Plane className="w-4 h-4 text-red-600"/>
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
                                    <div key={index} className="bg-white border-2 border-black px-3 py-1 text-sm font-bold flex items-center gap-2">
                                        <Map className="w-4 h-4 text-red-600"/>
                                        {place}
                                    </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="activities" className="mt-4">
                                <div className="flex flex-wrap gap-2">
                                    {itinerary.dining.map((item, index) => (
                                    <div key={index} className="bg-white border-2 border-black px-3 py-1 text-sm font-bold flex items-center gap-2">
                                        <Utensils className="w-4 h-4 text-red-600"/>
                                        {item}
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
                    {isTyping ? (
                         <div className="text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-16 h-16 mx-auto mb-4"
                            >
                               <Sparkles className="w-16 h-16 text-black" />
                            </motion.div>
                            <p className="text-black font-bold uppercase">Crafting your perfect journey...</p>
                         </div>
                    ) : (
                        <>
                            <Sparkles className="w-16 h-16 text-black mx-auto mb-4" />
                            <p className="text-black font-bold uppercase">Your AI-generated itineraries will appear here</p>
                        </>
                    )}
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
