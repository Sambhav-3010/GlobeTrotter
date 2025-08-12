"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Plus,
  Search,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface LocalPlace {
  id: string;
  title: string;
  description?: string;
  rating: number;
  reviews: number;
  address: string;
  phone?: string;
  hours?: string;
  website?: string;
  directions?: string;
}

export default function LocalPlacesPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<LocalPlace[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<LocalPlace[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 User-input table for API call
  const [searchTerm, setSearchTerm] = useState("Temples");
  const [searchLocation, setSearchLocation] = useState("New Delhi");

  // Load saved settings and selections
  useEffect(() => {
    const trip = JSON.parse(localStorage.getItem("trip-details") || "{}");
    if (trip.destination) {
      setSearchLocation(trip.destination);
    }

    const savedSelected = localStorage.getItem("localplaces-selections");
    if (savedSelected) {
      setSelectedPlaces(JSON.parse(savedSelected));
    }
  }, []);

  // Fetch places from backend
  const fetchPlaces = async () => {
    if (!searchTerm || !searchLocation) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/localplaces`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: searchTerm,
            location: searchLocation
          })
        }
      );

      const data = await res.json();
      if (Array.isArray(data.local_results || data)) {
        const results = (data.local_results || data).map((p: any) => ({
          id: p.place_id || p.position.toString(),
          title: p.title,
          description: p.description,
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          address: p.address || "",
          phone: p.phone,
          hours: p.hours,
          website: p.links?.website,
          directions: p.links?.directions
        }));
        setPlaces(results);
      }
    } catch (err) {
      console.error("Error fetching local places:", err);
    }
  };

  // Add to selected
  const handleAdd = (place: LocalPlace) => {
    if (selectedPlaces.find((p) => p.id === place.id)) return;
    const updated = [...selectedPlaces, place];
    setSelectedPlaces(updated);
    localStorage.setItem("activity-selections", JSON.stringify(updated));
  };

  // Remove from selected
  const handleRemove = (id: string) => {
    const updated = selectedPlaces.filter((p) => p.id !== id);
    setSelectedPlaces(updated);
    localStorage.setItem("activity-selections", JSON.stringify(updated));
  };

  // Filter by search query in results list
  const filtered = places.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      
      {/* HEADER */}
      <div className="bg-black p-4 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Button
            onClick={() => router.push("/manual-itinerary-builder")}
            className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK
          </Button>
          <h1 className="text-white text-2xl font-bold">LOCAL PLACES</h1>
        </div>
        <Button
          onClick={() => router.push("/manual-itinerary-builder/review")}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-white"
        >
          CONTINUE →
        </Button>
      </div>

      {/* SEARCH TERM + LOCATION INPUT */}
      <div className="max-w-7xl mx-auto p-6 bg-white border-b-4 border-black">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <Input
            placeholder="Type of place (Temples, Parks, Beaches...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-2 border-black font-bold flex-1"
          />
          <Input
            placeholder="Location (City/Area)"
            value={searchLocation}
            disabled
            onChange={(e) => setSearchLocation(e.target.value)}
            className="border-2 border-black font-bold flex-1"
          />
          <Button
            onClick={fetchPlaces}
            className="bg-green-400 hover:bg-green-500 text-black font-bold border-2 border-black"
          >
            SEARCH
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-2 gap-6">
        
        {/* Available Places */}
        <div className="bg-white border-4 border-black p-6 rounded-lg">
          {/* Filter box */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
            <Input
              placeholder="Filter results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-black font-bold"
            />
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-gray-50 border-2 border-black p-4 rounded-lg flex justify-between"
              >
                <div>
                  <h4 className="font-bold">{p.title}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {p.rating} ({p.reviews.toLocaleString()})
                  </div>
                  {p.description && <p className="text-xs">{p.description}</p>}
                  <p className="text-xs text-gray-700">📍 {p.address}</p>
                  {p.phone && <p className="text-xs">📞 {p.phone}</p>}
                  {p.hours && <p className="text-xs">⏰ {p.hours}</p>}
                </div>
                <Button
                  onClick={() => handleAdd(p)}
                  className="bg-yellow-400 hover:bg-yellow-500 border-2 border-black"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Places */}
        <div className="bg-white border-4 border-black p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-4">Your Selected Places</h3>
          {selectedPlaces.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {selectedPlaces.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 border-2 border-black p-4 flex justify-between"
                >
                  <div>
                    <h4 className="font-bold">{p.title}</h4>
                    <p className="text-xs">{p.address}</p>
                  </div>
                  <Button
                    onClick={() => handleRemove(p.id)}
                    className="bg-red-500 hover:bg-red-600 border-2 border-black text-white w-8 h-8 p-0"
                  >
                    ×
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p>No places selected yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}
