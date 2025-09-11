"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, MapPin, Globe, ArrowRight, ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TravelHistoryProps {
  userData: any
  updateUserData: (data: any) => void
  nextStep: () => void
  prevStep: () => void
}

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
  "Indore",
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
]

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
]

export default function TravelHistory({ userData, updateUserData, nextStep, prevStep }: TravelHistoryProps) {
  const [selectedCities, setSelectedCities] = useState<string[]>(userData.visitedCities || [])
  const [selectedCountries, setSelectedCountries] = useState<string[]>(userData.visitedCountries || [])
  const [citySearch, setCitySearch] = useState("")
  const [countrySearch, setCountrySearch] = useState("")

  const filteredCities = useMemo(() => {
    return indianCities.filter((city) => city.toLowerCase().includes(citySearch.toLowerCase()))
  }, [citySearch])

  const filteredCountries = useMemo(() => {
    return countries.filter((country) => country.toLowerCase().includes(countrySearch.toLowerCase()))
  }, [countrySearch])

  const totalTrips = selectedCities.length + selectedCountries.length

  const toggleCity = (city: string) => {
    setSelectedCities((prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]))
  }

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) => (prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]))
  }

  const removeCity = (city: string) => {
    setSelectedCities((prev) => prev.filter((c) => c !== city))
  }

  const removeCountry = (country: string) => {
    setSelectedCountries((prev) => prev.filter((c) => c !== country))
  }

  const handleContinue = () => {
    updateUserData({
      visitedCities: selectedCities,
      visitedCountries: selectedCountries,
    })
    nextStep()
  }

  const handleSkip = () => {
    updateUserData({
      visitedCities: [],
      visitedCountries: [],
    })
    nextStep()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* Header */}
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center">
          <div className="flex items-center gap-2">
            <div className="text-white text-2xl font-bold">GhumoFiro</div>
            <div className="bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded">BETA</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          {/* Header Message */}
          <div className="bg-white border-4 border-black p-6 mb-8 text-center">
            <h2 className="text-3xl font-black text-black mb-3 uppercase">SHARE YOUR TRAVEL HISTORY</h2>
            <p className="text-black font-medium mb-4">Tell us about the amazing places you've already explored</p>
            <div className="inline-flex items-center gap-2 bg-yellow-400 border-2 border-black px-4 py-2">
              <Globe className="w-5 h-5 text-black" />
              <span className="font-black text-black uppercase">Total Trips: {totalTrips}</span>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-8">
            {/* Selected Items Display */}
            {(selectedCities.length > 0 || selectedCountries.length > 0) && (
              <div className="mb-8 p-4 bg-gray-100 border-2 border-black">
                <h3 className="text-lg font-black text-black mb-4 uppercase">Your Selected Places</h3>

                {selectedCities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-black mb-2 uppercase">
                      Cities in India ({selectedCities.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCities.map((city) => (
                        <div
                          key={city}
                          className="flex items-center gap-2 bg-yellow-400 border-2 border-black text-black px-3 py-1 text-sm font-bold uppercase"
                        >
                          <span>{city}</span>
                          <button
                            onClick={() => removeCity(city)}
                            className="hover:bg-red-500 hover:text-white border border-black w-4 h-4 flex items-center justify-center text-xs"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCountries.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-black mb-2 uppercase">
                      Countries ({selectedCountries.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCountries.map((country) => (
                        <div
                          key={country}
                          className="flex items-center gap-2 bg-red-500 border-2 border-black text-white px-3 py-1 text-sm font-bold uppercase"
                        >
                          <span>{country}</span>
                          <button
                            onClick={() => removeCountry(country)}
                            className="hover:bg-yellow-400 hover:text-black border border-white w-4 h-4 flex items-center justify-center text-xs"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-8">
              {/* Indian Cities */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-black" />
                  <h3 className="text-xl font-black text-black uppercase">Cities in India</h3>
                  <div className="bg-yellow-400 border-2 border-black px-3 py-1">
                    <span className="text-black font-bold text-sm">{selectedCities.length} SELECTED</span>
                  </div>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="SEARCH INDIAN CITIES..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="pl-10 h-12 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold placeholder:text-gray-500 placeholder:font-bold uppercase"
                  />
                </div>

                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-gray-50 border-2 border-black">
                  {filteredCities.map((city) => (
                    <motion.button
                      key={city}
                      onClick={() => toggleCity(city)}
                      className={`px-4 py-2 text-sm font-bold transition-all duration-200 border-2 border-black uppercase ${
                        selectedCities.includes(city)
                          ? "bg-yellow-400 text-black scale-105"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                  <h3 className="text-xl font-black text-black uppercase">Countries Visited</h3>
                  <div className="bg-red-500 border-2 border-black px-3 py-1">
                    <span className="text-white font-bold text-sm">{selectedCountries.length} SELECTED</span>
                  </div>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="SEARCH COUNTRIES..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="pl-10 h-12 border-2 border-black focus:border-red-500 focus:ring-0 text-black font-bold placeholder:text-gray-500 placeholder:font-bold uppercase"
                  />
                </div>

                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-gray-50 border-2 border-black">
                  {filteredCountries.map((country) => (
                    <motion.button
                      key={country}
                      onClick={() => toggleCountry(country)}
                      className={`px-4 py-2 text-sm font-bold transition-all duration-200 border-2 border-black uppercase ${
                        selectedCountries.includes(country)
                          ? "bg-red-500 text-white scale-105"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {country}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8">
              <Button
                onClick={prevStep}
                className="flex-1 h-12 bg-white hover:bg-gray-50 text-black font-bold border-2 border-black"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                BACK
              </Button>
              <Button
                onClick={handleSkip}
                className="h-12 px-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-black"
              >
                SKIP
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-black"
              >
                CONTINUE
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
