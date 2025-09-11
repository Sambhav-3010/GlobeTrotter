"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plane, Train, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import airport from "@/components/airport.json";

const airportsData = airport as Record<
  string,
  {
    city: string;
    iata: string | null;
    name: string;
  }
>;

interface TravelItem {
  id: string;
  type: "flight" | "train";
  title: string;
  description: string;
  price: string;
  duration: string;
  departure: string;
  arrival: string;
  type_flight?: string;
}

function getAirportIataByName(city: string) {
  const lowerName = city.toLowerCase();
  for (const iata in airportsData) {
    const airport = airportsData[iata];
    if (airport.city.toLowerCase().includes(lowerName)) {
      return airport.iata || null;
    }
  }
  return null;
}

const sampleTrains: TravelItem[] = [];

export default function TravelPage() {
  const router = useRouter();
  const [selectedTravel, setSelectedTravel] = useState<TravelItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sampleFlights, setSampleFlights] = useState<TravelItem[]>([]);
  const [travelType, setTravelType] = useState<"all" | "flight" | "train">(
    "all"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const saved = JSON.parse(localStorage.getItem("trip-details") || "{}");
        if (!saved.destination || !saved.startDate || !saved.endDate || !saved.source) {
          console.warn("Missing required trip details or user info");
          return;
        }

        const payload = {
          departure_id: getAirportIataByName(saved.source),
          arrival_id: getAirportIataByName(saved.destination),
          outbound_date: saved.startDate,
          return_date: saved.endDate,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/flights`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.ok && (data?.best_flights || data?.other_flights)) {
          let allFlights = data?.best_flights;
          if (allFlights.length === 0) {
            allFlights = data?.other_flights.slice(0, 10);
          }

          const parsedFlights: TravelItem[] = allFlights.map(
            (flight: any, index: number) => {
              const firstSeg = flight.flights[0];
              const lastSeg = flight.flights[flight.flights.length - 1];
              return {
                id: `flight-${index}`,
                type: "flight",
                title: `${firstSeg.departure_airport.name} → ${lastSeg.arrival_airport.name}`,
                description: `${firstSeg.airline} ${firstSeg.flight_number}`,
                price: `${flight.price}`,
                duration: `${flight.total_duration} mins`,
                departure: firstSeg.departure_airport.name,
                arrival: lastSeg.arrival_airport.name,
                type_flight: flight.type,
              };
            }
          );
          setSampleFlights(parsedFlights); // fresh load each time
        } else {
          console.error("Failed to fetch travel data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching travel data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddTravel = (item: TravelItem) => {
    if (selectedTravel.find((t) => t.id === item.id)) return; // avoid duplicates
    const updated = [...selectedTravel, item];
    setSelectedTravel(updated);
    localStorage.setItem("travel-selections", JSON.stringify(updated));

    const progress = JSON.parse(localStorage.getItem("trip-progress") || "[]");
    if (!progress.includes("travel")) {
      progress.push("travel");
      localStorage.setItem("trip-progress", JSON.stringify(progress));
    }
  };

  const handleRemoveTravel = (id: string) => {
    const updated = selectedTravel.filter((item) => item.id !== id);
    setSelectedTravel(updated);
    localStorage.setItem("travel-selections", JSON.stringify(updated));
  };

  const getFilteredResults = () => {
    const allResults = [...sampleFlights, ...sampleTrains];
    return allResults.filter((item) => {
      const matchesType = travelType === "all" || item.type === travelType;
      const matchesSearch =
        (item.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        );
      return matchesType && matchesSearch;
    });
  };

  const handleContinue = () => {
    router.push("/manual-itinerary-builder/hotels");
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
            <div className="text-white text-2xl font-bold">
              TRAVEL SELECTION
            </div>
          </div>
          <Button
            onClick={handleContinue}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-white"
          >
            CONTINUE TO HOTELS →
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Available Travel Options */}
          <div className="space-y-6">
            <div className="bg-white border-4 border-black p-6">
              <h3 className="text-lg font-black text-black mb-4 uppercase flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Available Travel Options
              </h3>

              {/* Search Controls */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                  <Input
                    placeholder="SEARCH FLIGHTS & TRAINS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-black"
                  />
                </div>
                <Select
                  value={travelType}
                  onValueChange={(value: any) => setTravelType(value)}
                >
                  <SelectTrigger className="w-32 border-2 border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ALL</SelectItem>
                    <SelectItem value="flight">FLIGHTS</SelectItem>
                    <SelectItem value="train">TRAINS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getFilteredResults().map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 border-2 border-black p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.type === "flight" ? (
                            <Plane className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Train className="w-5 h-5 text-green-500" />
                          )}
                          <h4 className="font-black text-black uppercase">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-sm text-black font-medium mb-2">
                          {item.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-black font-bold">
                          <span className="bg-yellow-400 w-24 px-2 py-1">
                            Price: {item.price}
                          </span>
                          <span>Duration: {item.duration}</span>
                          <span>Departure: {item.departure}</span>
                          <span>Arrival: {item.arrival}</span>
                          {item.type === "flight" && (
                            <span>Type: {item.type_flight}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddTravel(item)}
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

          {/* Selected Travel */}
          <div className="bg-white border-4 border-black p-6">
            <h3 className="text-lg font-black text-black mb-4 uppercase">
              Your Selected Travel
            </h3>

            {selectedTravel.length > 0 ? (
              <div className="space-y-4">
                {selectedTravel.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 border-2 border-black p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-8 h-8 border-2 border-black flex items-center justify-center flex-shrink-0 ${
                            item.type === "flight"
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                        >
                          {item.type === "flight" ? (
                            <Plane className="w-4 h-4 text-white" />
                          ) : (
                            <Train className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-black uppercase">
                            {item.title}
                          </h4>
                          <p className="text-sm text-black font-medium mb-2">
                            {item.description}
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-xs text-black font-bold">
                            <span>
                              {item.departure} → {item.arrival}
                            </span>
                            <span>{item.duration}</span>
                          </div>
                          <div className="bg-yellow-400 border border-black px-2 py-1 text-xs font-bold inline-block mt-2">
                            {item.price}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveTravel(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black w-8 h-8 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </motion.div>
                ))}

                <div className="pt-4 border-t-2 border-black">
                  <div className="flex justify-between items-center">
                    <span className="text-black font-bold">
                      TOTAL TRAVEL COST:
                    </span>
                    <span className="text-xl font-black text-black">
                      ₹
                      {selectedTravel
                        .reduce(
                          (sum, item) =>
                            sum + Number(item.price.replace(/[₹,]/g, "")),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-black font-bold uppercase">
                  No travel selected yet. Choose from available options.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
