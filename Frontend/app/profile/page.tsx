"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any | null>(null);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [travelHistory, setTravelHistory] = useState<any[]>([]);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch user data");

        const data = await res.json();
        setUserData(data);

        const tripsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/trip/my-trips`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          setMyTrips(tripsData.trips);
        } else {
          setMyTrips([]);
        }

        const placesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/trip/history`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const placesData = await placesResponse.json();
        setTravelHistory(placesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!userData) return null;

  return (
    <div className="min-h-screen pb-10 bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
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
                <User className="w-16 h-16 text-gray-400" />
              </div>

              <h2 className="text-2xl font-black text-black mb-6 uppercase">
                {userData.fullName}
              </h2>

              <div className="space-y-4 text-black">
                <div className="flex items-center justify-center gap-2 p-2 border-2 border-gray-200">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">{userData.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 border-2 border-gray-200">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {userData.phoneNumber ? `+91 ${userData.phoneNumber}` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 border-2 border-gray-200">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium capitalize">
                    {userData.city}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 p-2 border-2 border-gray-200">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {userData.age ? `${userData.age} years old` : ""}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-400 border-2 border-black">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-black" />
                  <span className="font-black text-black uppercase">
                    Travel Stats
                  </span>
                </div>
                <p className="text-3xl font-black text-black">
                  {userData.numberOfTrips}
                </p>
                <p className="text-sm font-bold text-black uppercase">
                  Total Trips
                </p>
              </div>
            </motion.div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recently Visited */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-4 border-black p-8"
            >
              <h3 className="text-xl font-black text-black uppercase mb-4">
                Recently Visited
              </h3>
              <p className="text-black font-medium">
                {userData.recentlyVisited || "No recent visits"}
              </p>
            </motion.div>

            {/* All Places Visited */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-4 border-black p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-black" />
                <h3 className="text-xl font-black text-black uppercase">
                  Travel History
                </h3>
                <div className="bg-yellow-400 border-2 border-black px-3 py-1">
                  <span className="text-black font-bold text-sm">
                    {travelHistory?.length || 0}
                  </span>
                </div>
              </div>

              {travelHistory?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {travelHistory.map((trip: any, index: number) => (
                    <motion.div
                      key={trip._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="bg-gradient-to-br from-yellow-100 via-white to-orange-100 
                     border-4 border-black p-5 rounded-xl shadow-md 
                     hover:shadow-lg transition-all"
                    >
                      <h4 className="text-lg font-extrabold text-black mb-2">
                        {trip.place_of_visit}
                      </h4>
                      <p className="text-sm text-gray-700 mb-1">
                        {new Date(trip.start_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        –{" "}
                        {new Date(trip.end_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                      </p>
                      <p className="text-sm font-bold text-black">
                        Budget: ₹{trip.overall_budget.toLocaleString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-black font-medium">
                  No travel history available
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* My Itineraries */}
      <motion.div className="max-w-6xl mx-auto mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black p-8"
        >
          <h3 className="text-2xl font-black uppercase mb-6 text-center text-black">
            My Itineraries
          </h3>

          {myTrips.length === 0 ? (
            <p className="text-center text-black font-medium">
              No itineraries created yet
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {myTrips.map((trip, index) => (
                <motion.div
                  key={trip._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => router.push(`/trips/${trip._id}`)}
                  className="group relative bg-gradient-to-br from-red-300 via-red-100 to-orange-500
                       border-4 border-black p-6 rounded-2xl shadow-lg cursor-pointer 
                       hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                >
                  <h4 className="text-lg font-extrabold text-black mb-2 group-hover:underline">
                    {trip.place_of_visit}
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    {new Date(trip.start_date).toLocaleDateString("en-GB")} –{" "}
                    {new Date(trip.end_date).toLocaleDateString("en-GB")} (
                    {trip.duration_of_visit} days)
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm font-bold text-black">
                      Budget: ₹{trip.overall_budget.toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-red-600">
                      Spent: ₹{trip.total_spent.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
