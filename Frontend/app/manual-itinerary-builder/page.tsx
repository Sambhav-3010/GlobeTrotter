"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plane,
  Hotel,
  Camera,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TripDetails {
  budget: string;
  tripType: string;
  destination: string;
  startDate: string;
  endDate: string;
}

const steps = [
  {
    id: "hotels",
    title: "HOTELS",
    description: "Select accommodations",
    icon: Hotel,
    route: "/manual-itinerary-builder/hotels",
    color: "bg-green-500",
  },
  {
    id: "activities",
    title: "ACTIVITIES",
    description: "Plan your adventures",
    icon: Camera,
    route: "/manual-itinerary-builder/activities",
    color: "bg-purple-500",
  },
  {
    id: "travel",
    title: "TRAVEL",
    description: "Choose flights and trains",
    icon: Plane,
    route: "/manual-itinerary-builder/travel",
    color: "bg-blue-500",
  },
];

export default function ManualItineraryBuilderPage() {
  const router = useRouter();
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const savedDetails = localStorage.getItem("trip-details");
    const savedProgress = localStorage.getItem("trip-progress");

    if (savedDetails) {
      setTripDetails(JSON.parse(savedDetails));
    }
    if (savedProgress) {
      const parsedProgress: string[] = JSON.parse(savedProgress);
      const validIds = steps.map((step) => step.id);
      const filteredProgress = parsedProgress.filter((id) =>
        validIds.includes(id)
      );
      setCompletedSteps(filteredProgress);
      localStorage.setItem("trip-progress", JSON.stringify(filteredProgress));
    }
  }, []);

  const handleStepClick = (route: string) => {
    router.push(route);
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-500">
      {/* Header */}
      <div className="bg-black p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
            <div className="text-white text-2xl font-bold">
              MANUAL TRIP BUILDER
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Trip Overview */}
        {tripDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-4 border-black p-6 mb-8"
          >
            <h2 className="text-2xl font-black text-black mb-4 uppercase">
              Your Trip Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-black font-bold">
                  DESTINATION: {tripDetails.destination}
                </p>
                <p className="text-black font-bold">
                  BUDGET: {tripDetails.budget}
                </p>
              </div>
              <div>
                <p className="text-black font-bold">
                  TYPE: {tripDetails.tripType}
                </p>
                <p className="text-black font-bold">
                  DATES: {tripDetails.startDate} - {tripDetails.endDate}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black p-6 mb-8"
        >
          <div className="text-center">
            <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-4xl font-black text-black mb-4 uppercase">
              Build Your Perfect Trip
            </h1>
            <p className="text-black font-medium text-lg">
              Create your custom itinerary step by step. Choose your travel,
              accommodations and activities options.
            </p>
          </div>
        </motion.div>

        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isLast = index === steps.length - 1;
            const oddSteps = steps.length % 2 !== 0;
            const cardClass = oddSteps && isLast ? "md:col-span-2" : "";

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white w-full border-4 border-black overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${cardClass}`}
                onClick={() => handleStepClick(step.route)}
              >
                <div className={`${step.color} p-4 border-b-4 border-black`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-8 h-8 text-white" />
                      <div>
                        <h3 className="text-xl font-black text-white">
                          {step.title}
                        </h3>
                        <p className="text-white font-medium">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded">
                        ✓ DONE
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-black font-medium">
                      {isCompleted
                        ? "Review and modify your selections"
                        : "Start planning this section"}
                    </p>
                    <ArrowRight className="w-5 h-5 text-black" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border-4 border-black p-6 mt-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-black mb-2 uppercase">
                Progress
              </h3>
              <p className="text-black font-medium">
                {completedSteps.length} of {steps.length} sections completed
              </p>
            </div>
            <div className="flex gap-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-4 h-4 border-2 border-black ${
                    completedSteps.includes(step.id)
                      ? "bg-yellow-400"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {completedSteps.length === steps.length && (
            <div className="mt-4 pt-4 border-t-2 border-black">
              <Button
                onClick={() => router.push("/manual-itinerary-builder/review")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg h-12 border-2 border-black"
              >
                REVIEW & FINALIZE TRIP →
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
