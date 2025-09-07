const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('../utils/asyncHandler');

const ITINERARY_SCHEMA = {
  type: "OBJECT",
  properties: {
    id: { 
        type: "STRING", 
        description: "A unique ID for the itinerary. Generate a new UUID for each plan." 
    },
    title: { 
        type: "STRING", 
        description: "A catchy and descriptive title for the trip, e.g., 'A Week of Wonders in Kyoto'." 
    },
    destination: { 
        type: "STRING", 
        description: "The primary destination city and country, e.g., 'Kyoto, Japan'." 
    },
    duration: { 
        type: "STRING", 
        description: "The total duration of the trip as a string, e.g., '7 Days'." 
    },
    budget: { 
        type: "STRING", 
        description: "The estimated budget per person, including currency symbol/code, e.g., 'INR2500'." 
    },
    days: {
      type: "ARRAY",
      description: "A day-by-day breakdown of the travel plan.",
      items: {
        type: "OBJECT",
        properties: {
          day: { 
              type: "INTEGER",
              description: "The day number of the itinerary (e.g., 1, 2, 3)."
          },
          title: { 
              type: "STRING",
              description: "A short, thematic title for the day's plan, e.g., 'Ancient Temples and Geishas'."
          },
          activities: {
            type: "ARRAY",
            description: "A list of 3-4 key activities planned for the day.",
            items: { type: "STRING" }
          },
          meals: {
            type: "ARRAY",
            description: "A list of 2-3 meal suggestions for the day, can include restaurant names or types of food.",
            items: { type: "STRING" }
          },
          accommodation: { 
              type: "STRING", 
              description: "A suggestion for the night's accommodation, e.g., 'Ryokan in Gion District'." 
          }
        },
        required: ["day", "title", "activities", "meals"]
      }
    },
    flights: {
      type: "ARRAY",
      description: "A list of suggested flight options for the main travel legs of the trip.",
      items: {
        type: "OBJECT",
        properties: {
          departure: { 
              type: "STRING", 
              description: "Departure city and airport code, e.g., 'San Francisco (SFO)'." 
          },
          arrival: { 
              type: "STRING", 
              description: "Arrival city and airport code, e.g., 'Osaka (KIX)'." 
          },
          price: { 
              type: "STRING", 
              description: "Estimated price of a round-trip or one-way ticket, e.g., 'Rs1200 INR'." 
          }
        },
        required: ["departure", "arrival", "price"]
      }
    },
    places: {
      type: "ARRAY",
      description: "A summary list of 5-7 notable places, landmarks, or attractions to visit during the trip.",
      items: { type: "STRING" }
    },
    activities: {
      type: "ARRAY",
      description: "A summary list of 5-7 general types of activities available on the trip (e.g., 'Temple Hopping', 'Food Tours').",
      items: { type: "STRING" }
    },
    dining: {
      type: "ARRAY",
      description: "A summary list of 5-7 recommended restaurants or unique dining experiences.",
      items: { type: "STRING" }
    }
  },
  required: ["id", "title", "destination", "duration", "budget", "days", "flights", "places", "activities", "dining"]
};

exports.generateItinerary = asyncHandler(async (req, res) => {
  const { prompt: userInput } = req.body;

  if (!userInput) {
    res.status(400);
    throw new Error("User prompt is required.");
  }

  const API_KEY = process.env.GOOGLE_API_KEY;
  if (!API_KEY) {
    console.error("GOOGLE_API_KEY not found in environment.");
    res.status(500);
    throw new Error("Server configuration error.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: ITINERARY_SCHEMA,
    },
  });

  const fullPrompt = `You are an expert travel planner AI. Your task is to create a detailed, day-by-day travel itinerary based on the user's request.
    Analyze the user's prompt to understand their destination, dates/duration, budget, and trip type.
    Then, populate every single field defined in the provided JSON schema to create a complete and logical travel plan.
    Generate a unique UUID for the 'id' field.

    User's Request: "${userInput}"
    `;

  const result = await model.generateContent(fullPrompt);
  const responseText = result.response.text();
  const itineraryJson = JSON.parse(responseText);

  res.status(200).json(itineraryJson);
});
