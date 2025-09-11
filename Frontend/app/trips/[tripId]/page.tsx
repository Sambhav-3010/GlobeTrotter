"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Car,
  Hotel,
  Compass,
  Plane,
  MapPin,
  Calendar,
  Clock,
  Zap,
  IndianRupeeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

interface TravelDetail {
  arrival: string;
  departure: string;
  description: string;
  price: string;
  duration: string;
}

interface HotelDetail {
  title: string;
  thumbnail: string;
  rating: number;
  price: number;
  location: string;
  description: string;
  amenities: string[];
}

interface ActivityDetail {
  title: string;
  time: string;
  description: string;
  address: string;
  reviews: number;
  rating: number;
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

export default function TripDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/trip/${tripId}`,
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
  }, [tripId, router]);

  const budgetUsed = trip ? (trip.total_spent / trip.overall_budget) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500 flex items-center justify-center">
        <p className="text-white text-2xl font-bold">LOADING TRIP DETAILS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-4 border-black p-8 max-w-md text-center"
        >
          <h2 className="text-3xl font-black text-black mb-4 uppercase">
            ERROR!
          </h2>
          <p className="text-black font-medium text-lg mb-6">{error}</p>
          <Button
            onClick={() => router.push("/profile")}
            className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            GO BACK
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-4 border-black p-8 max-w-md text-center"
        >
          <MapPin className="w-16 h-16 mx-auto mb-4 text-black" />
          <h2 className="text-3xl font-black text-black mb-4 uppercase">
            TRIP NOT FOUND!
          </h2>
          <p className="text-black font-medium text-lg mb-6">
            The adventure you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => router.push("/profile")}
            className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            GO BACK
          </Button>
        </motion.div>
      </div>
    );
  }
  console.log(trip.hotels);
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
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
          <div className="flex items-center gap-3">
            <h1 className="text-white text-3xl font-black uppercase tracking-wide">
              {trip.place_of_visit} ITINERARY
            </h1>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <div></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Trip Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black p-6 mb-8"
        >
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <Calendar className="w-8 h-8 mx-auto mb-2 text-black" />
              <p className="text-black font-black text-2xl">
                {trip.duration_of_visit}
              </p>
              <p className="text-black font-bold uppercase text-sm">DAYS</p>
              <p className="text-black text-xs mt-1">
                {new Date(trip.start_date).toLocaleDateString("en-GB")} -{" "}
                {new Date(trip.end_date).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div>
              <IndianRupeeIcon className="w-8 h-8 mx-auto mb-2 text-black" />
              <p className="text-black font-black text-2xl">
                ₹{trip.overall_budget.toLocaleString()}
              </p>
              <p className="text-black font-bold uppercase text-sm">BUDGET</p>
              <p className="text-black text-xs mt-1">
                Spent: ₹{trip.total_spent.toLocaleString()}
              </p>
            </div>
            <div>
              <Compass className="w-8 h-8 mx-auto mb-2 text-black" />
              <p className="text-black font-black text-2xl">
                {trip.activities?.length || 0}
              </p>
              <p className="text-black font-bold uppercase text-sm">
                ACTIVITIES
              </p>
              <p className="text-black text-xs mt-1">Planned</p>
            </div>
            <div>
              <Hotel className="w-8 h-8 mx-auto mb-2 text-black" />
              <p className="text-black font-black text-2xl">
                {trip.hotels?.length || 0}
              </p>
              <p className="text-black font-bold uppercase text-sm">HOTELS</p>
              <p className="text-black text-xs mt-1">Booked</p>
            </div>
          </div>
        </motion.div>

        {/* Budget Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-yellow-400 border-4 border-black p-4 mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-black font-black text-lg uppercase">
              BUDGET USAGE
            </p>
            <p className="text-black font-black text-lg">
              {budgetUsed.toFixed(1)}%
            </p>
          </div>
          <div className="w-full bg-white border-2 border-black h-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetUsed, 100)}%` }}
              transition={{ delay: 0.5, duration: 1 }}
              className={`h-full ${
                budgetUsed > 100
                  ? "bg-red-500"
                  : budgetUsed > 80
                  ? "bg-orange-500"
                  : "bg-red-500"
              } border-r-2 border-black`}
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Travel Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white border-4 border-black"
          >
            <div className="bg-black p-4">
              <h3 className="text-white font-black text-xl uppercase flex items-center gap-2">
                <Plane className="w-6 h-6" />
                TRAVEL
              </h3>
            </div>
            <div className="p-6">
              {trip.travel?.length ? (
                <div className="space-y-4">
                  {trip.travel.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="border-2 border-black p-4"
                    >
                      <p className="font-medium text-black uppercase mb-2">
                        <strong>Departure: </strong>
                        {item.departure}
                      </p>
                      <p className="font-medium text-black uppercase mb-2">
                        <strong>Arrival: </strong>
                        {item.arrival}
                      </p>
                      <p className="text-black font-medium">
                        <strong>Flight Number: </strong>
                        {item.description}
                      </p>
                      <p className="text-black font-medium flex items-center align-center gap-5 mt-2">
                        <p className="flex items-center align-center">
                          <strong>Price: </strong>
                          <IndianRupeeIcon className="w-4 h-4 inline-block" />
                          {item.price}
                        </p>
                        <p className="flex items-center align-center">
                          <strong>Duration: </strong>
                          <Clock className="w-4 h-4 inline-block" />
                          {item.duration}
                        </p>
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-black font-bold uppercase">
                    NO TRAVEL PLANNED
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Hotels Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-4 border-black"
          >
            <div className="bg-black p-4">
              <h3 className="text-white font-black text-xl uppercase flex items-center gap-2">
                <Hotel className="w-6 h-6" />
                HOTELS
              </h3>
            </div>
            <div className="p-6">
              {trip.hotels?.length ? (
                <div className="space-y-4">
                  {trip.hotels.map((hotel, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="border-2 border-black p-4"
                    >
                      <p className="font-black text-black text-lg uppercase mb-3">
                        {hotel.title}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-black font-medium">
                            <Image
                              src={hotel.thumbnail}
                              alt="Thumbnail"
                              height={150}
                              width={150}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="text-black font-bold text-sm uppercase">
                            Description
                            <p className="text-black font-medium">
                              {hotel.description || "None Provided"}
                            </p>
                          </div>
                        </div>
                        <div className="text-black font-bold text-sm uppercase">
                          Location
                          <p className="text-black font-medium">
                            {hotel.location || "Not Provided"}
                          </p>
                        </div>
                        <div className="text-black font-bold text-sm uppercase">
                          Rating & Reviews
                          <p className="text-black font-medium">
                            {hotel.rating || "4.0"}⭐
                          </p>
                        </div>
                        <div className="text-black font-bold text-sm uppercase">
                          Price
                          <p className="text-black font-medium">
                            <IndianRupeeIcon className="w-4 h-4 inline-block" />
                            {hotel.price}
                          </p>
                        </div>
                        <div className="text-black font-bold text-sm uppercase">
                          Amenities
                          <ul className="text-black font-medium decoration-slice">
                            {hotel.amenities.map((amenitie, index) => (
                              <li key={index}>• {amenitie}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-black font-bold uppercase">
                    NO HOTELS BOOKED
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Activities Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white border-4 border-black mt-8"
        >
          <div className="bg-black p-4">
            <h3 className="text-white font-black text-xl uppercase flex items-center gap-2">
              <Compass className="w-6 h-6" />
              ACTIVITIES & EXPERIENCES
            </h3>
          </div>
          <div className="p-6">
            {trip.activities?.length ? (
              <div className="grid md:grid-cols-2 gap-6">
                {trip.activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="border-2 border-black p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-black text-black text-lg uppercase">
                        {activity.title}
                      </p>
                      <div className="bg-yellow-400 border-2 border-black px-2 py-1">
                        <p className="text-black font-bold text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    <p className="text-black font-medium">
                      {activity.description}
                    </p>
                    <p className="text-black font-medium mt-2">
                      <strong>Address:</strong> {activity.address}
                    </p>
                    <p className="text-black font-medium">
                      {activity.rating}⭐, {activity.reviews}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-black font-bold uppercase text-xl">
                  NO ACTIVITIES PLANNED YET
                </p>
                <p className="text-black font-medium">
                  Time to add some adventure to your trip!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-yellow-400 border-4 border-black p-6 mt-8 text-center"
        >
          <p className="text-black font-black text-2xl uppercase tracking-wide">
            READY FOR YOUR ADVENTURE? PACK YOUR BAGS! 🎒
          </p>
        </motion.div>
      </div>
    </div>
  );
}
