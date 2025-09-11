"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Hotel, Plus, Search, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface HotelItem {
  thumbnail?: string | null;
  id: string;
  title: string;
  description?: string;
  price: number;
  rating: string | number;
  amenities: string[];
  location: string;
}

// Utility to parse "₹6,500" => 6500
const parsePrice = (val: any): number => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return Number(val.toString().replace(/[^0-9.]/g, "")) || 0;
};

export default function HotelsPage() {
  const router = useRouter();
  const [selectedHotels, setSelectedHotels] = useState<HotelItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<"all" | "budget" | "mid" | "luxury">("all");
  const [availableHotels, setAvailableHotels] = useState<HotelItem[]>([]);
  const [adults, setAdults] = useState<number>(1);

  useEffect(() => {
    const saved = localStorage.getItem("hotel-selections");
    if (saved) {
      setSelectedHotels(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const saved = JSON.parse(localStorage.getItem("trip-details") || "{}");
        if (!saved.destination || !saved.startDate || !saved.endDate) {
          console.warn("Missing hotel search criteria");
          return;
        }

        const requestBody = {
          q: saved.destination,
          check_in_date: saved.startDate,
          check_out_date: saved.endDate,
          adults: adults.toString(),
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          credentials: "include"
        });

        if (!response.ok) {
          console.error("Failed hotel fetch:", await response.text());
          return;
        }

        const data = await response.json();

        const hotelsFromAds = (data.ads || []).map((ad: any) => ({
          id: ad.name || ad.property_token,
          title: ad.name || "Unknown Hotel",
          description: ad.description || "",
          price: parsePrice(ad.price || ad.rate_per_night?.lowest),
          rating: ad.overall_rating || 0,
          amenities: ad.amenities || [],
          location: ad.address || "",
          thumbnail: ad.thumbnail || null,
        }));

        const hotelsFromProps = (data.properties || [])
          .filter((p: any) => p.type === "hotel")
          .map((p: any) => ({
            id: p.name || p.property_token,
            title: p.name || "Unknown Hotel",
            description: p.description || "",
            price: parsePrice(p.rate_per_night?.lowest || p.total_rate?.lowest),
            rating: p.overall_rating || 0,
            amenities: p.amenities || [],
            location: p.location || "",
            thumbnail: p.images?.[0]?.thumbnail || null,
          }));

        setAvailableHotels([...hotelsFromAds, ...hotelsFromProps]);
      } catch (err) {
        console.error("Error fetching hotels:", err);
      }
    };

    fetchHotels();
  }, [adults]); // re-fetch when adults changes

  const handleAddHotel = (item: HotelItem) => {
    const updated = [...selectedHotels, { ...item, id: `${item.id}-${Date.now()}` }];
    setSelectedHotels(updated);
    localStorage.setItem("hotel-selections", JSON.stringify(updated));

    const progress = JSON.parse(localStorage.getItem("trip-progress") || "[]");
    if (!progress.includes("hotels")) {
      progress.push("hotels");
      localStorage.setItem("trip-progress", JSON.stringify(progress));
    }
  };

  const handleRemoveHotel = (id: string) => {
    const updated = selectedHotels.filter((item) => item.id !== id);
    setSelectedHotels(updated);
    localStorage.setItem("hotel-selections", JSON.stringify(updated));
  };

  const getFilteredResults = () => {
    return availableHotels.filter((item) => {
      const searchMatch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location || "").toLowerCase().includes(searchQuery.toLowerCase());

      let matchesPrice = true;
      if (priceRange !== "all" && item.price > 0) {
        if (priceRange === "budget") matchesPrice = item.price < 4000;
        else if (priceRange === "mid") matchesPrice = item.price >= 4000 && item.price <= 10000;
        else if (priceRange === "luxury") matchesPrice = item.price > 10000;
      }

      return searchMatch && matchesPrice;
    });
  };

  const handleContinue = () => {
    router.push("/manual-itinerary-builder/activities");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* Header */}
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
            <div className="text-white text-2xl font-bold">HOTEL SELECTION</div>
          </div>
          <Button
            onClick={handleContinue}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-white"
          >
            CONTINUE TO ACTIVITIES →
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-4">
          <Users className="w-5 h-5 text-white" />
          <label className="text-white font-bold">Adults:</label>
          <Select value={adults.toString()} onValueChange={(val: string) => setAdults(parseInt(val))}>
            <SelectTrigger className="w-24 border-2 border-black bg-white font-bold">
              <SelectValue placeholder={adults.toString()} />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Available Hotels */}
          <div className="space-y-6">
            <div className="bg-white border-4 border-black p-6">
              <h3 className="text-lg font-black text-black mb-4 uppercase flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                Available Hotels
              </h3>

              {/* Search & Filter */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black w-5 h-5" />
                  <Input
                    placeholder="SEARCH HOTELS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-black font-bold"
                  />
                </div>
                <Select value={priceRange} onValueChange={(value: any) => setPriceRange(value)}>
                  <SelectTrigger className="w-32 border-2 border-black font-bold">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ALL</SelectItem>
                    <SelectItem value="budget">BUDGET (&lt;4K)</SelectItem>
                    <SelectItem value="mid">MID (4K–10K)</SelectItem>
                    <SelectItem value="luxury">LUXURY (&gt;10K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getFilteredResults().map((item,index) => (
                  <div key={item.id+index} className="bg-gray-50 border-2 border-black p-4 flex">
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-20 h-20 object-cover border border-black mr-3"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-black text-black uppercase">{item.title}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-xs font-bold">
                            {item.rating && item.rating !== 0 ? item.rating : "Unrated"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-bold mb-1">
                        📍 {item.location || "Address not available"}
                      </p>
                      <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold inline-block mb-2">
                        {item.price > 0 ? `₹${item.price.toLocaleString()}` : "Price Not Available"}
                      </div>
                      {item.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.amenities.map((a) => (
                            <span
                              key={a}
                              className="bg-blue-100 text-xs px-2 py-1 border border-blue-300 font-bold"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleAddHotel(item)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-black ml-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Hotels */}
          <div className="bg-white border-4 border-black p-6">
            <h3 className="text-lg font-black text-black mb-4 uppercase">Your Selected Hotels</h3>
            {selectedHotels.length > 0 ? (
              <div className="space-y-4">
                {selectedHotels.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 border-2 border-black p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-black uppercase">{item.title}</h4>
                        <p className="text-xs text-gray-600 font-bold mb-1">📍 {item.location}</p>
                        <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold">
                          {item.price > 0 ? `₹${item.price.toLocaleString()}` : "Price Not Available"}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveHotel(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black w-8 h-8 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">No hotels selected yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}