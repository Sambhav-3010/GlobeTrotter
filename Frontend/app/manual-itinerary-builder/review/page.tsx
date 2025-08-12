"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Plane,
  Hotel,
  Camera,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// For activities/hotels/travel, add extra optional fields for display
interface ItemBase {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  location?: string;
  amenities?: string[];
  price: number;
  rating?: string | number;
  duration?: string;
  thumbnail?: string | null;
}

interface TripDetails {
  destination: string;
  budget: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalSpent: number;
}

interface TripSelections {
  travel: ItemBase[];
  hotels: ItemBase[];
  activities: ItemBase[];
}

export default function ReviewPage() {
  const router = useRouter();
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [selections, setSelections] = useState<TripSelections>({
    travel: [],
    hotels: [],
    activities: [],
  });

  useEffect(() => {
    const savedDetails = localStorage.getItem("trip-details");
    const travelSelections = localStorage.getItem("travel-selections");
    const hotelSelections = localStorage.getItem("hotel-selections");
    const activitySelections = localStorage.getItem("activity-selections");
    if (savedDetails) setTripDetails(JSON.parse(savedDetails));
    let loadedSelections: TripSelections = {
      travel: travelSelections ? JSON.parse(travelSelections) : [],
      hotels: hotelSelections ? JSON.parse(hotelSelections) : [],
      activities: activitySelections ? JSON.parse(activitySelections) : [],
    };
    console.log("activities:", loadedSelections.activities);
    setSelections(loadedSelections);
  }, []);

  const calculateTotal = () =>
    Object.values(selections).reduce(
      (sum, category) =>
        sum +
        category.reduce(
          (catSum: number, item: { price: any }) =>
            catSum + Number(item.price) || 0,
          0
        ),
      0
    );

  const handleEditSection = (section: string) => {
    router.push(`/manual-itinerary-builder/${section}`);
  };

  const handleConfirmTrip = async () => {
    if (!tripDetails) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const payload = {
      user_id: user._id,
      place_of_visit: tripDetails.destination,
      duration_of_visit: tripDetails.duration,
      start_date: tripDetails.startDate,
      end_date: tripDetails.endDate,
      overall_budget: Number(tripDetails.budget),
      total_spent: calculateTotal(),
      travel: selections.travel,
      hotels: selections.hotels,
      activities: selections.activities,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/newtrip`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save trip");
      const data = await res.json();
      alert("Trip saved!");
      router.push(`/trips/${data.trip._id}`);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  if (!tripDetails) {
    return <div className="text-center text-white p-10">Loading...</div>;
  }

  const total = calculateTotal();
  const budget = Number(tripDetails.budget) || 0;
  const isOverBudget = total > budget;

  const sections = [
    {
      id: "travel",
      title: "Travel",
      icon: Plane,
      color: "bg-blue-500",
      items: selections.travel,
    },
    {
      id: "hotels",
      title: "Hotels",
      icon: Hotel,
      color: "bg-green-500",
      items: selections.hotels,
    },
    {
      id: "activities",
      title: "Activities",
      icon: Camera,
      color: "bg-purple-500",
      items: selections.activities,
    },
  ];

  // Helper to show either .title or .name
  const getTitle = (item: any) => item.title || item.name || "No Title";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* HEADER */}
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/manual-itinerary-builder")}
              className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
            <div className="text-white text-2xl font-bold">Trip Review</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* TRIP SUMMARY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black p-6 mb-8 rounded-md"
        >
          <h1 className="text-3xl font-black text-black mb-6 uppercase text-center">
            Your Complete Itinerary
          </h1>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="text-black font-bold">
                  Destination: {tripDetails.destination}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                <span className="text-black font-bold">
                  {tripDetails.startDate} - {tripDetails.endDate} (
                  {tripDetails.duration} days)
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-500" />
                <span className="text-black font-bold">
                  Budget: ₹{budget.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-500" />
                <span
                  className={`font-bold ${
                    isOverBudget ? "text-red-500" : "text-green-600"
                  }`}
                >
                  Total Cost: ₹{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {isOverBudget && (
            <div className="mt-4 bg-red-100 border-2 border-red-500 p-4 rounded">
              <p className="text-red-700 font-bold text-center">
                ⚠️ WARNING: Your selections exceed your budget by ₹
                {(total - budget).toLocaleString()}
              </p>
            </div>
          )}
        </motion.div>

        {/* ITINERARY SECTIONS */}
        {sections.map((section, index) => {
          const Icon = section.icon;
          const sectionTotal = section.items.reduce(
            (sum, item) => sum + Number(item.price),
            0
          );

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-4 border-black mb-6 rounded-md overflow-hidden"
            >
              <div className={`${section.color} p-4 border-b-4 border-black`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-black text-white">
                      {section.title}
                    </h3>
                    <span className="text-white font-bold">
                      (₹{sectionTotal.toLocaleString()})
                    </span>
                  </div>
                  <Button
                    onClick={() => handleEditSection(section.id)}
                    className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    EDIT
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {section.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No selections made
                  </p>
                ) : (
                  <div className="space-y-4">
                    {section.items.map((item, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-gray-50 border-2 border-black p-4 flex items-center gap-5 justify-between rounded"
                      >
                        {/* ICON/THUMBNAIL (if available) */}
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt={getTitle(item)}
                            className="w-16 h-16 object-cover border border-black rounded-lg"
                          />
                        )}
                        {/* Main Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {/* Show section title/icon for clarity */}
                            {section.id === "travel" && (
                              <Plane className="w-5 h-5 text-blue-500" />
                            )}
                            {section.id === "hotels" && (
                              <Hotel className="w-5 h-5 text-green-700" />
                            )}
                            {section.id === "activities" && (
                              <Camera className="w-5 h-5 text-purple-600" />
                            )}
                            <h4 className="font-black uppercase text-black truncate">
                              {getTitle(item)}
                            </h4>
                            {/* Rating */}
                            {item.rating && Number(item.rating) > 0 && (
                              <span className="flex items-center gap-1 ml-2 text-yellow-700 font-bold">
                                <Star className="w-4 h-4" /> {item.rating}
                              </span>
                            )}
                          </div>
                          {item.location && (
                            <p className="text-xs text-gray-600 font-bold mb-1 flex items-center gap-1">
                              <MapPin className="w-4 h-4" /> {item.location}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-sm text-gray-800 mb-1">
                              {item.description}
                            </p>
                          )}
                          {item.amenities && item.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {item.amenities.map((am: string) => (
                                <span
                                  key={am}
                                  className="bg-blue-100 text-xs px-2 py-1 border border-blue-300 font-bold rounded"
                                >
                                  {am}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.duration && (
                            <div className="flex items-center gap-1 text-xs font-bold text-black">
                              <Clock className="w-3 h-3" /> {item.duration}
                            </div>
                          )}
                        </div>
                        {/* Price */}
                        <span className="bg-yellow-400 border border-black px-3 py-1 text-md font-black rounded">
                          {item.price
                            ? "₹" + Number(item.price).toLocaleString()
                            : "Free"}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* FINAL ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border-4 border-black p-6 rounded-md"
        >
          <div className="text-center space-y-4">
            <div className="text-2xl font-black">
              TOTAL TRIP COST:{" "}
              <span
                className={isOverBudget ? "text-red-500" : "text-green-600"}
              >
                ₹{total.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push("/manual-itinerary-builder")}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-8 py-3 border-2 border-black"
              >
                MAKE CHANGES
              </Button>
              <Button
                onClick={handleConfirmTrip}
                disabled={isOverBudget}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold px-8 py-3 border-2 border-black"
              >
                {isOverBudget ? "OVER BUDGET" : "CONFIRM TRIP"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
