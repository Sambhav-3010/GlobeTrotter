"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Globe, ArrowRight, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const indianCities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Goa",
  "Kochi",
  "Thiruvananthapuram",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Salem",
  "Tirunelveli",
  "Udaipur",
  "Jodhpur",
  "Bikaner",
  "Ajmer",
  "Pushkar",
  "Mount Abu",
  "Rishikesh",
  "Haridwar",
  "Dehradun",
  "Mussoorie",
  "Nainital",
  "Jim Corbett",
  "Shimla",
  "Manali",
  "Dharamshala",
  "Amritsar",
  "Chandigarh",
  "Agra",
  "Varanasi",
  "Allahabad",
  "Khajuraho",
  "Bhopal",
  "Indore",
  "Ujjain",
  "Gwalior",
  "Orchha",
  "Darjeeling",
  "Gangtok",
  "Kalimpong",
  "Shillong",
  "Guwahati",
  "Kaziranga",
  "Imphal",
  "Aizawl",
  "Kohima",
  "Itanagar",
];

const countries = [
  "Thailand",
  "Singapore",
  "Malaysia",
  "Indonesia",
  "Vietnam",
  "Cambodia",
  "Philippines",
  "Japan",
  "South Korea",
  "China",
  "Hong Kong",
  "Taiwan",
  "Maldives",
  "Sri Lanka",
  "Nepal",
  "Bhutan",
  "Myanmar",
  "Laos",
  "United States",
  "Canada",
  "United Kingdom",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Netherlands",
  "Switzerland",
  "Austria",
  "Greece",
  "Turkey",
  "Russia",
  "Australia",
  "New Zealand",
  "Dubai",
  "Egypt",
  "South Africa",
  "Kenya",
  "Tanzania",
  "Morocco",
  "Brazil",
  "Argentina",
  "Chile",
  "Peru",
  "Mexico",
  "Costa Rica",
  "Iceland",
  "Norway",
  "Sweden",
  "Denmark",
  "Finland",
];

type TripDetails = {
  place_of_visit: string;
  start_date: string;
  end_date: string;
  duration_of_visit: number;
  overall_budget: number;
};

export default function TravelHistoryPage() {
  const router = useRouter();
  const [selectedTrips, setSelectedTrips] = useState<TripDetails[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  // redirect if no profile
  useEffect(() => {
    const profile = localStorage.getItem("user");
    if (!profile) {
      router.push("/onboarding");
    }
  }, [router]);

  const filteredCities = useMemo(
    () =>
      indianCities.filter((city) =>
        city.toLowerCase().includes(citySearch.toLowerCase())
      ),
    [citySearch]
  );

  const filteredCountries = useMemo(
    () =>
      countries.filter((country) =>
        country.toLowerCase().includes(countrySearch.toLowerCase())
      ),
    [countrySearch]
  );

  const totalTrips = selectedTrips.length;

  // Toggle selection
  const togglePlace = (place: string) => {
    setSelectedTrips((prev) => {
      const existing = prev.find((t) => t.place_of_visit === place);
      if (existing) {
        return prev.filter((t) => t.place_of_visit !== place);
      } else {
        return [
          ...prev,
          {
            place_of_visit: place,
            start_date: "",
            end_date: "",
            duration_of_visit: 0,
            overall_budget: 0,
          },
        ];
      }
    });
  };

  // Update details for a selected place
  const updateTripDetails = (
    place: string,
    field: keyof TripDetails,
    value: any
  ) => {
    setSelectedTrips((prev) =>
      prev.map((t) =>
        t.place_of_visit === place
          ? {
              ...t,
              [field]:
                field === "overall_budget" || field === "duration_of_visit"
                  ? Number(value)
                  : value,
            }
          : t
      )
    );
  };

  const removePlace = (place: string) => {
    setSelectedTrips((prev) => prev.filter((t) => t.place_of_visit !== place));
  };

  const handleContinue = async () => {
    const travelData = {
      tripDetails: selectedTrips.map((trip) => ({
        userId: JSON.parse(localStorage.getItem("user") || '{}').id,
        place_of_visit: trip.place_of_visit,
        start_date: trip.start_date,
        end_date: trip.end_date,
        duration_of_visit: trip.duration_of_visit,
        overall_budget: trip.overall_budget,
      })),
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/trip/history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(travelData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error from server:", response.status, errorData);
        alert(`Failed to save travel history: ${response.status}`);
        return;
      }

      const result = await response.json();
      router.push("/dashboard");
    } catch (err) {
      console.error("Network error sending travel history:", err);
      alert("Network error. Please try again.");
    }
  };

  const handleSkip = async () => {
    const travelData = {
      placesVisited: [],
      recentlyVisited: "",
      noOfTrips: 0,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/trip/history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(travelData),
          credentials: "include",
        }
      );

      router.push("/dashboard");
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* HEADER */}
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-white text-2xl font-bold">globetrotter</div>
            <div className="bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded">
              BETA
            </div>
          </div>
          <Button
            onClick={() => router.push("/onboarding")}
            className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> BACK
          </Button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          {/* Header */}
          <div className="bg-white border-4 border-black p-6 mb-8 text-center">
            <h2 className="text-3xl font-black text-black mb-3 uppercase">
              Share Your Travel History
            </h2>
            <p className="text-black font-medium mb-4">
              Tell us about the amazing places you've explored
            </p>
            <div className="inline-flex items-center gap-2 bg-yellow-400 border-2 border-black px-4 py-2">
              <Globe className="w-5 h-5 text-black" />
              <span className="font-black text-black uppercase">
                Total Trips: {totalTrips}
              </span>
            </div>
          </div>

          {/* City & Country Selection */}
          <div className="space-y-8">
            {/* Cities */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-black" />
                <h3 className="text-xl font-black text-black uppercase">
                  Cities in India
                </h3>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                <Input
                  placeholder="Search Indian Cities..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="pl-10 h-12 border-2 border-black"
                />
              </div>
              <div className="flex flex-wrap gap-2 bg-gray-50 border-2 border-black p-4">
                {filteredCities.map((city) => (
                  <motion.button
                    key={city}
                    onClick={() => togglePlace(city)}
                    className={`px-4 py-2 text-sm font-bold border-2 border-black uppercase ${
                      selectedTrips.some((t) => t.place_of_visit === city)
                        ? "bg-yellow-400"
                        : "bg-white"
                    }`}
                  >
                    {city}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-black" />
                <h3 className="text-xl font-black text-black uppercase">
                  Countries Visited
                </h3>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                <Input
                  placeholder="Search Countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="pl-10 h-12 border-2 border-black"
                />
              </div>
              <div className="flex flex-wrap gap-2 bg-gray-50 border-2 border-black p-4">
                {filteredCountries.map((country) => (
                  <motion.button
                    key={country}
                    onClick={() => togglePlace(country)}
                    className={`px-4 py-2 text-sm font-bold border-2 border-black uppercase ${
                      selectedTrips.some((t) => t.place_of_visit === country)
                        ? "bg-red-500 text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    {country}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Places Details */}
          {selectedTrips.length > 0 && (
            <div className="mb-8 p-4 bg-gray-100 border-2 border-black">
              <h3 className="text-lg font-black text-black mb-4 uppercase">
                Your Selected Trips
              </h3>
              {selectedTrips.map((trip, idx) => (
                <div
                  key={idx}
                  className="p-4 border-2 border-black bg-white mb-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold uppercase">
                      {trip.place_of_visit}
                    </h4>
                    <button
                      onClick={() => removePlace(trip.place_of_visit)}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold">Start Date</label>
                      <Input
                        type="date"
                        value={trip.start_date}
                        onChange={(e) =>
                          updateTripDetails(
                            trip.place_of_visit,
                            "start_date",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="font-bold">End Date</label>
                      <Input
                        type="date"
                        value={trip.end_date}
                        onChange={(e) => {
                          updateTripDetails(
                            trip.place_of_visit,
                            "end_date",
                            e.target.value
                          );
                          if (trip.start_date && e.target.value) {
                            const duration = Math.ceil(
                              (new Date(e.target.value).getTime() -
                                new Date(trip.start_date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            );
                            updateTripDetails(
                              trip.place_of_visit,
                              "duration_of_visit",
                              duration
                            );
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="font-bold">Duration (Days)</label>
                      <Input
                        type="number"
                        min={1}
                        value={trip.duration_of_visit}
                        onChange={(e) =>
                          updateTripDetails(
                            trip.place_of_visit,
                            "duration_of_visit",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="font-bold">Overall Budget</label>
                      <Input
                        type="number"
                        min={0}
                        value={trip.overall_budget}
                        onChange={(e) =>
                          updateTripDetails(
                            trip.place_of_visit,
                            "overall_budget",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NAV Buttons */}
          <div className="flex gap-4 pt-8">
            <Button
              onClick={() => router.push("/onboarding")}
              className="flex-1 h-12 bg-white border-2 border-black text-black"
            >
              <ArrowLeft className="ml-2" /> Back
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 h-12 bg-red-500 text-white border-2 border-black"
            >
              Continue <ArrowRight className="ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
