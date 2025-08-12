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
  Languages,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any | null>(null);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?._id) {
          router.push("/auth");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: user._id }),
          }
        );

        if (!res.ok) throw new Error("Failed to fetch user data");

        const data = await res.json();
        setUserData(data);

        // Fetch user's trips/itineraries
        const tripsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/trips/user/${user._id}`,
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
          setMyTrips(tripsData);
        } else {
          setMyTrips([]);
        }
      } catch (err) {
        console.error(err);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!userData) return null;

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
                  {userData.numberOfTrips || 0}
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
                  Places Visited
                </h3>
                <div className="bg-yellow-400 border-2 border-black px-3 py-1">
                  <span className="text-black font-bold text-sm">
                    {userData.placesVisited?.length || 0}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {userData.placesVisited?.length > 0 ? (
                  userData.placesVisited.map((place: string, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-100 border-2 border-black px-3 py-1 text-black font-bold text-sm uppercase"
                    >
                      {place}
                    </div>
                  ))
                ) : (
                  <p className="text-black font-medium">
                    No places visited yet
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* My Itineraries */}
      <motion.div className="bg-white border-4 border-black p-8">
        <h3 className="text-xl font-black uppercase mb-4">My Itineraries</h3>
        {myTrips.length === 0 ? (
          <p>No itineraries created yet</p>
        ) : (
          <div className="space-y-4">
            {myTrips.map((trip) => (
              <div
                key={trip._id}
                className="bg-gray-50 border-2 border-black p-4 cursor-pointer hover:bg-gray-100"
                onClick={() => router.push(`/trips/${trip._id}`)}
              >
                <h4 className="font-bold">{trip.place_of_visit}</h4>
                <p>
                  {new Date(trip.start_date).toLocaleDateString()} -{" "}
                  {new Date(trip.end_date).toLocaleDateString()} (
                  {trip.duration_of_visit} days)
                </p>
                <p>
                  Budget: ₹{trip.overall_budget.toLocaleString()} | Spent: ₹
                  {trip.total_spent.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
