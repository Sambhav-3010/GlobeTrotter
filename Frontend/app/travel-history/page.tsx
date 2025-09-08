"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Globe, ArrowRight, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext"; // Import useUser
import { useAlert } from "../context/AlertContext"; // Import useAlert
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
  place_of_visit: string[]; // Can be multiple places for a single trip entry
  start_date: string;
  end_date: string;
  overall_budget: number;
};

export default function TravelHistoryPage() {
  const router = useRouter();
  const { user, setUser } = useUser(); // Get user and setUser from context
  const { showAlert } = useAlert(); // Get showAlert from context
  const [trips, setTrips] = useState<TripDetails[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

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

  const totalTrips = trips.length;

  const addTrip = (place: string) => {
    setTrips((prev) => [
      ...prev,
      {
        place_of_visit: [place],
        start_date: "",
        end_date: "",
        overall_budget: 0,
      },
    ]);
  };

  const removeTrip = (index: number) => {
    setTrips((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTripField = (index: number, field: keyof TripDetails, value: any) => {
    setTrips((prev) =>
      prev.map((trip, i) =>
        i === index ? { ...trip, [field]: value } : trip
      )
    );
  };

  const handleContinue = async () => {
    const userId = user?._id;
    if (!userId) {
      showAlert("Authentication required. Please log in again.", "destructive");
      router.push("/auth");
      return;
    }

    const isValid = trips.every(trip => {
      if (!trip.place_of_visit.length) {
        showAlert("Each trip must have at least one place of visit.", "destructive");
        return false;
      }
      if (!trip.start_date || !trip.end_date) {
        showAlert("Please provide both start and end dates for all trips.", "destructive");
        return false;
      }
      if (new Date(trip.start_date) > new Date(trip.end_date)) {
        showAlert("Start date cannot be after end date for a trip.", "destructive");
        return false;
      }
      if (trip.overall_budget < 0) {
        showAlert("Budget cannot be negative.", "destructive");
        return false;
      }
      return true;
    });

    if (!isValid) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/travelhistory/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ trips }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error from server:", response.status, errorData);
        showAlert(
          `Failed to save travel history: ${errorData.message || response.statusText}`,
          "destructive"
        );
        return;
      }

      showAlert("Travel history saved successfully!", "success");
      localStorage.removeItem('travelHistoryRequired'); // Clear the flag after successful submission
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Network error sending travel history:", err);
      showAlert(err.message || "Network error. Please try again.", "destructive");
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
                    onClick={() => addTrip(city)} // Use addTrip
                    className={`px-4 py-2 text-sm font-bold border-2 border-black uppercase ${
                      trips.some(t => t.place_of_visit.includes(city)) // Check if city is in any trip
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
                    onClick={() => addTrip(country)} // Use addTrip
                    className={`px-4 py-2 text-sm font-bold border-2 border-black uppercase ${
                      trips.some(t => t.place_of_visit.includes(country)) // Check if country is in any trip
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

          {/* Selected Trips Details */}
          {trips.length > 0 && (
            <div className="mb-8 p-4 bg-gray-100 border-4 border-black mt-8">
              <h3 className="text-2xl font-black text-black mb-4 uppercase">
                Your Selected Trips
              </h3>
              {trips.map((trip, index) => (
                <div
                  key={index}
                  className="p-6 border-2 border-black bg-white mb-4 relative"
                >
                  <button
                    onClick={() => removeTrip(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h4 className="font-bold uppercase text-xl mb-4">
                    Trip to: {trip.place_of_visit.join(", ")}
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor={`startDate-${index}`} className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <Input
                        id={`startDate-${index}`}
                        type="date"
                        value={trip.start_date}
                        onChange={(e) =>
                          updateTripField(index, "start_date", e.target.value)
                        }
                        className="mt-1 block w-full h-10 border-2 border-black"
                      />
                    </div>
                    <div>
                      <label htmlFor={`endDate-${index}`} className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <Input
                        id={`endDate-${index}`}
                        type="date"
                        value={trip.end_date}
                        onChange={(e) =>
                          updateTripField(index, "end_date", e.target.value)
                        }
                        className="mt-1 block w-full h-10 border-2 border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`budget-${index}`} className="block text-sm font-medium text-gray-700">
                      Overall Budget (INR)
                    </label>
                    <Input
                      id={`budget-${index}`}
                      type="number"
                      value={trip.overall_budget === 0 ? "" : trip.overall_budget}
                      onChange={(e) =>
                        updateTripField(
                          index,
                          "overall_budget",
                          Number(e.target.value)
                        )
                      }
                      className="mt-1 block w-full h-10 border-2 border-black"
                      min="0"
                    />
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
