"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Globe, ArrowRight, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext"; // Import useUser
import Cookies from "js-cookie"; // Import Cookies

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
  const { user, setUser } = useUser(); // Get user and setUser from context
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]); // Change to string[]
  const [citySearch, setCitySearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  // Redirect if no profile or no token
  useEffect(() => {
    if (!user && !Cookies.get("token")) {
      router.push("/auth");
    }
  }, [router, user]);

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
      if (prev.includes(place)) {
        return prev.filter((p) => p !== place);
      } else {
        return [...prev, place];
      }
    });
  };

  // Update details for a selected place (This function will be removed or repurposed if not needed)
  const updateTripDetails = (
    place: string,
    field: keyof TripDetails,
    value: any
  ) => {
    // This function might become obsolete if we only store place names
  };

  const removePlace = (place: string) => {
    setSelectedTrips((prev) => prev.filter((p) => p !== place));
  };

  const handleContinue = async () => {
    const token = Cookies.get("token");
    const userId = user?._id;

    if (!token || !userId) {
      console.error("Authentication token or user ID missing.");
      // Use showAlert here if you have it in this component's context
      alert("Authentication required. Please log in again.");
      router.push("/auth");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/past-travels`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ placesVisited: selectedTrips }), // Send only placesVisited
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error from server:", response.status, errorData);
        alert(`Failed to save travel history: ${response.status}`);
        return;
      }

      const result = await response.json();
      setUser(result.user); // Update user context with updated data
      router.push("/dashboard");
    } catch (err) {
      console.error("Network error sending travel history:", err);
      alert("Network error. Please try again.");
    }
  };

  const handleSkip = async () => {
    const token = Cookies.get("token");
    const userId = user?._id;

    if (!token || !userId) {
      console.error("Authentication token or user ID missing.");
      alert("Authentication required. Please log in again.");
      router.push("/auth");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/past-travels`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ placesVisited: [] }), // Send empty array for skip
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error from server:", response.status, errorData);
        alert(`Failed to skip travel history: ${response.status}`);
        return;
      }
      const result = await response.json();
      setUser(result.user); // Update user context
      router.push("/dashboard");
    } catch (err) {
      console.error("Network error skipping travel history:", err);
      alert("Network error. Please try again.");
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
                      selectedTrips.includes(city)
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
                      selectedTrips.includes(country)
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
                      {trip}
                    </h4>
                    <button
                      onClick={() => removePlace(trip)}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* The following details are removed as per the new_code */}
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
