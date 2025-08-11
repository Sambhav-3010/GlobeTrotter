"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

// Types
interface TravelItem {
  id: string
  type: "flight" | "train"
  title: string
  description: string
  price: string
  duration: string
  departure: string
  arrival: string
}

interface HotelItem {
  id: string
  name: string
  description: string
  price: string
  rating: number
  amenities: string[]
  image: string
}

interface ActivityItem {
  id: string
  title: string
  description: string
  price: string
  duration: string
  category: string
  image: string
}

interface DiningItem {
  id: string
  name: string
  cuisine: string
  price: string
  rating: number
  description: string
  image: string
}

interface TripSetup {
  destination: string
  budget: number
  startDate: string
  endDate: string
  duration: number
}

interface ItineraryState {
  tripSetup: TripSetup | null
  travelSelections: TravelItem[]
  hotelSelections: HotelItem[]
  activitySelections: ActivityItem[]
  diningSelections: DiningItem[]
  completedSteps: string[]
  totalCost: number
}

// Actions
type ItineraryAction =
  | { type: "SET_TRIP_SETUP"; payload: TripSetup }
  | { type: "ADD_TRAVEL"; payload: TravelItem }
  | { type: "REMOVE_TRAVEL"; payload: string }
  | { type: "ADD_HOTEL"; payload: HotelItem }
  | { type: "REMOVE_HOTEL"; payload: string }
  | { type: "ADD_ACTIVITY"; payload: ActivityItem }
  | { type: "REMOVE_ACTIVITY"; payload: string }
  | { type: "ADD_DINING"; payload: DiningItem }
  | { type: "REMOVE_DINING"; payload: string }
  | { type: "MARK_STEP_COMPLETE"; payload: string }
  | { type: "UNMARK_STEP_COMPLETE"; payload: string }
  | { type: "CALCULATE_TOTAL" }
  | { type: "RESET_ITINERARY" }
  | { type: "LOAD_FROM_STORAGE"; payload: ItineraryState }

const initialState: ItineraryState = {
  tripSetup: null,
  travelSelections: [],
  hotelSelections: [],
  activitySelections: [],
  diningSelections: [],
  completedSteps: [],
  totalCost: 0,
}

// Helper function to calculate total cost
const calculateTotalCost = (state: ItineraryState): number => {
  const travelCost = state.travelSelections.reduce(
    (sum, item) => sum + Number.parseInt(item.price.replace(/[₹,]/g, "")),
    0,
  )
  const hotelCost = state.hotelSelections.reduce(
    (sum, item) => sum + Number.parseInt(item.price.replace(/[₹,]/g, "")),
    0,
  )
  const activityCost = state.activitySelections.reduce(
    (sum, item) => sum + Number.parseInt(item.price.replace(/[₹,]/g, "")),
    0,
  )
  const diningCost = state.diningSelections.reduce(
    (sum, item) => sum + Number.parseInt(item.price.replace(/[₹,]/g, "")),
    0,
  )
  return travelCost + hotelCost + activityCost + diningCost
}

// Reducer
const itineraryReducer = (state: ItineraryState, action: ItineraryAction): ItineraryState => {
  let newState: ItineraryState

  switch (action.type) {
    case "SET_TRIP_SETUP":
      newState = { ...state, tripSetup: action.payload }
      break

    case "ADD_TRAVEL":
      newState = {
        ...state,
        travelSelections: [...state.travelSelections, { ...action.payload, id: `${action.payload.id}-${Date.now()}` }],
      }
      if (!state.completedSteps.includes("travel")) {
        newState.completedSteps = [...state.completedSteps, "travel"]
      }
      break

    case "REMOVE_TRAVEL":
      newState = {
        ...state,
        travelSelections: state.travelSelections.filter((item) => item.id !== action.payload),
      }
      if (newState.travelSelections.length === 0) {
        newState.completedSteps = state.completedSteps.filter((step) => step !== "travel")
      }
      break

    case "ADD_HOTEL":
      newState = {
        ...state,
        hotelSelections: [...state.hotelSelections, { ...action.payload, id: `${action.payload.id}-${Date.now()}` }],
      }
      if (!state.completedSteps.includes("hotels")) {
        newState.completedSteps = [...state.completedSteps, "hotels"]
      }
      break

    case "REMOVE_HOTEL":
      newState = {
        ...state,
        hotelSelections: state.hotelSelections.filter((item) => item.id !== action.payload),
      }
      if (newState.hotelSelections.length === 0) {
        newState.completedSteps = state.completedSteps.filter((step) => step !== "hotels")
      }
      break

    case "ADD_ACTIVITY":
      newState = {
        ...state,
        activitySelections: [
          ...state.activitySelections,
          { ...action.payload, id: `${action.payload.id}-${Date.now()}` },
        ],
      }
      if (!state.completedSteps.includes("activities")) {
        newState.completedSteps = [...state.completedSteps, "activities"]
      }
      break

    case "REMOVE_ACTIVITY":
      newState = {
        ...state,
        activitySelections: state.activitySelections.filter((item) => item.id !== action.payload),
      }
      if (newState.activitySelections.length === 0) {
        newState.completedSteps = state.completedSteps.filter((step) => step !== "activities")
      }
      break

    case "ADD_DINING":
      newState = {
        ...state,
        diningSelections: [...state.diningSelections, { ...action.payload, id: `${action.payload.id}-${Date.now()}` }],
      }
      if (!state.completedSteps.includes("dining")) {
        newState.completedSteps = [...state.completedSteps, "dining"]
      }
      break

    case "REMOVE_DINING":
      newState = {
        ...state,
        diningSelections: state.diningSelections.filter((item) => item.id !== action.payload),
      }
      if (newState.diningSelections.length === 0) {
        newState.completedSteps = state.completedSteps.filter((step) => step !== "dining")
      }
      break

    case "MARK_STEP_COMPLETE":
      newState = {
        ...state,
        completedSteps: state.completedSteps.includes(action.payload)
          ? state.completedSteps
          : [...state.completedSteps, action.payload],
      }
      break

    case "UNMARK_STEP_COMPLETE":
      newState = {
        ...state,
        completedSteps: state.completedSteps.filter((step) => step !== action.payload),
      }
      break

    case "CALCULATE_TOTAL":
      newState = { ...state, totalCost: calculateTotalCost(state) }
      break

    case "RESET_ITINERARY":
      newState = initialState
      break

    case "LOAD_FROM_STORAGE":
      newState = action.payload
      break

    default:
      return state
  }

  // Always recalculate total cost after any change
  newState.totalCost = calculateTotalCost(newState)
  return newState
}

// Context
const ItineraryContext = createContext<{
  state: ItineraryState
  dispatch: React.Dispatch<ItineraryAction>
  // Helper functions
  isOverBudget: () => boolean
  getRemainingBudget: () => number
  getBudgetPercentage: () => number
  canAfford: (price: string) => boolean
} | null>(null)

// Provider
export const ItineraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(itineraryReducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("itinerary")
    if (saved) {
      try {
        const parsedState = JSON.parse(saved)
        dispatch({ type: "LOAD_FROM_STORAGE", payload: parsedState })
      } catch (error) {
        console.error("Failed to load itinerary from storage:", error)
      }
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("itinerary", JSON.stringify(state))
  }, [state])

  // Helper functions
  const isOverBudget = () => {
    return state.tripSetup ? state.totalCost > state.tripSetup.budget : false
  }

  const getRemainingBudget = () => {
    return state.tripSetup ? state.tripSetup.budget - state.totalCost : 0
  }

  const getBudgetPercentage = () => {
    return state.tripSetup ? (state.totalCost / state.tripSetup.budget) * 100 : 0
  }

  const canAfford = (price: string) => {
    const itemPrice = Number.parseInt(price.replace(/[₹,]/g, ""))
    return state.tripSetup ? state.totalCost + itemPrice <= state.tripSetup.budget : true
  }

  return (
    <ItineraryContext.Provider
      value={{
        state,
        dispatch,
        isOverBudget,
        getRemainingBudget,
        getBudgetPercentage,
        canAfford,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  )
}

// Hook
export const useItinerary = () => {
  const context = useContext(ItineraryContext)
  if (!context) {
    throw new Error("useItinerary must be used within an ItineraryProvider")
  }
  return context
}

// Export types
export type { TravelItem, HotelItem, ActivityItem, DiningItem, TripSetup, ItineraryState }