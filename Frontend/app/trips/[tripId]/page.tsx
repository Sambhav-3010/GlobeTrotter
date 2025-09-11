"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, Hotel, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface TravelDetail {
  mode: string;
  description: string;
}

interface HotelDetail {
  name: string;
  check_in: string;
  check_out: string;
}

interface ActivityDetail {
  name: string;
  time: string;
  description: string;
}

interface Trip {
  _id: string;
  place_of_visit: string;
  start_date: string;
  end_date: string;
  duration_of_visit: number;
  overall_budget: number;
  total_spent: number;
  travel: TravelDetail[];
  hotels: HotelDetail[];
  activities: ActivityDetail[];
}

export default function TripDetailsPage({ params }: { params: { tripId: string } }) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?._id) {
          router.push("/auth");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/trips/${params.tripId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch trip details");
        }

        const data = await res.json();
        setTrip(data.trip);
      } catch (err: any) {
        console.error("Error fetching trip details:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [params.tripId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500 flex items-center justify-center text-white text-2xl">
        Loading trip details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500 flex items-center justify-center text-white text-2xl">
        Error: {error}
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500 flex items-center justify-center text-white text-2xl">
        Trip not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500 p-8">
      {/* Header */}
      <div className="bg-black p-4 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => router.push("/profile")}
            className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            BACK TO PROFILE
          </Button>
          <h1 className="text-white text-3xl font-bold uppercase">
            {trip.place_of_visit} Itinerary
          </h1>
          <div></div> {/* For spacing */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white border-4 border-black p-8 shadow-2xl">
        <div className="text-center mb-10">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            {new Date(trip.start_date).toLocaleDateString()} -{" "}
            {new Date(trip.end_date).toLocaleDateString()}
          </p>
          <p className="text-md text-gray-600">
            Duration: {trip.duration_of_visit} days
          </p>
          <p className="text-md text-gray-600">
            Budget: ₹{trip.overall_budget.toLocaleString()} | Spent: ₹
            {trip.total_spent.toLocaleString()}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Travel Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border-2 border-black p-6 bg-gray-50"
          >
            <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
              <Car className="w-6 h-6" /> Travel
            </h3>
            {trip.travel && trip.travel.length > 0 ? (
              <ul className="space-y-4">
                {trip.travel.map((item, index) => (
                  <li key={index} className="border-b pb-2">
                    <p className="font-semibold">{item.mode}</p>
                    <p className="text-sm text-gray-700">{item.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No travel details planned.</p>
            )}
          </motion.div>

          {/* Hotel Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border-2 border-black p-6 bg-gray-50"
          >
            <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
              <Hotel className="w-6 h-6" /> Hotels
            </h3>
            {trip.hotels && trip.hotels.length > 0 ? (
              <ul className="space-y-4">
                {trip.hotels.map((item, index) => (
                  <li key={index} className="border-b pb-2">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-700">Check-in: {new Date(item.check_in).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-700">Check-out: {new Date(item.check_out).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No hotel bookings planned.</p>
            )}
          </motion.div>

          {/* Activity Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border-2 border-black p-6 bg-gray-50"
          >
            <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
              <Compass className="w-6 h-6" /> Activities
            </h3>
            {trip.activities && trip.activities.length > 0 ? (
              <ul className="space-y-4">
                {trip.activities.map((item, index) => (
                  <li key={index} className="border-b pb-2">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-700">Time: {item.time}</p>
                    <p className="text-sm text-gray-700">{item.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No activities planned.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
