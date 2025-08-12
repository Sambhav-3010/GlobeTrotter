from flask import Flask, request, jsonify
import pandas as pd
from collections import defaultdict, Counter
from pymongo import MongoClient
from bson import ObjectId
import random
from datetime import datetime

# --- Constants ---
MONGO_URI = "mongodb+srv://sambhav:t5uKgPk3xgeXcf7A@cluster0.s7uiifm.mongodb.net/"
DB_NAME = "test"
USERS_COLLECTION = "users"
TRIPS_COLLECTION = "trips"

# Fallback recommendations for Indian cities and international destinations
FALLBACK_RECOMMENDATIONS = [
    "mumbai", "delhi", "bangalore", "chennai", "kolkata", "hyderabad", "pune",
    "jaipur", "ahmedabad", "surat", "lucknow", "kanpur", "nagpur", "indore",
    "thane", "bhopal", "visakhapatnam", "pimpri-chinchwad", "patna", "vadodara",
    "goa", "kerala", "rajasthan", "himachal pradesh", "uttarakhand",
    "paris", "london", "tokyo", "new york", "dubai", "singapore", "thailand",
    "bali", "maldives", "nepal", "bhutan", "sri lanka", "malaysia", "vietnam"
]

# --- Database Connection ---
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()  # Test connection
    db = client[DB_NAME]
    users_collection = db[USERS_COLLECTION]
    trips_collection = db[TRIPS_COLLECTION]
    print("MongoDB connection successful.")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None
    users_collection = None
    trips_collection = None

# --- Data Fetching and Cleaning ---
def fetch_and_clean_data(collection, id_fields, to_lowercase_fields=[]):
    """
    Fetches data from a MongoDB collection and returns a cleaned pandas DataFrame.
    - Converts specified ID fields to lowercase strings.
    - Handles potential missing data gracefully.
    """
    if db is None:
        return pd.DataFrame()
    
    try:
        data = list(collection.find({}))
        if not data:
            return pd.DataFrame()

        for doc in data:
            for field in id_fields:
                if field in doc:
                    doc[field] = str(doc[field]).strip().lower()
            for field in to_lowercase_fields:
                 if field in doc and isinstance(doc[field], str):
                    doc[field] = doc[field].strip().lower()

        return pd.DataFrame(data)
    except Exception as e:
        print(f"Error fetching data from {collection.name}: {e}")
        return pd.DataFrame()

def fetch_users_df():
    """Fetch and clean user data."""
    return fetch_and_clean_data(users_collection, id_fields=['_id'], to_lowercase_fields=['city'])

def fetch_trips_df():
    """Fetch and clean trip data."""
    return fetch_and_clean_data(trips_collection, id_fields=['_id', 'user_id'])

# --- Helper Functions ---
def normalize_place(s):
    """Normalizes a string by stripping whitespace and converting to lowercase."""
    if s is None or s == "":
        return ""
    return str(s).strip().lower()

def recency_weight(date_str, min_date, max_date):
    """Calculates a recency score for a date string."""
    if pd.isna(date_str):
        return 0.0
    try:
        d = pd.to_datetime(date_str)
        total_days = (max_date - min_date).days
        if total_days == 0:
            return 1.0
        return (d - min_date).days / total_days
    except (ValueError, TypeError):
        return 0.0

def get_user_by_id(user_oid_str):
    """Fetches a single user from MongoDB by their ObjectId string."""
    if users_collection is None:
        return None
    try:
        user = users_collection.find_one({"_id": ObjectId(user_oid_str)})
        if user:
            user['_id'] = str(user['_id']) # Convert ObjectId to string for consistency
        return user
    except Exception as e:
        print(f"Error fetching user by ID {user_oid_str}: {e}")
        return None

def get_all_user_places(user_doc):
    """Extract all places visited by a user from their document."""
    if not user_doc:
        return set()
    
    places = set()
    
    # Get from placesVisited array
    places_visited = user_doc.get('placesVisited', [])
    if isinstance(places_visited, list):
        for place in places_visited:
            if place:
                places.add(normalize_place(place))
    
    # Get from recentlyVisited array
    recently_visited = user_doc.get('recentlyVisited', [])
    if isinstance(recently_visited, list):
        for place in recently_visited:
            if place:
                places.add(normalize_place(place))
    
    return places

def get_recently_visited_places(user, trips_df):
    """
    Extract recently visited places from user's placesVisited array.
    Returns the most recent place or None if no places found.
    """
    recently_visited = user.get('recentlyVisited', [])
    places_visited = user.get('placesVisited', [])
    
    # First try recentlyVisited array
    if recently_visited:
        return recently_visited[0]  # Most recent place
    
    # Fallback to placesVisited array (last item)
    if places_visited:
        return places_visited[-1]  # Last place in the array
    
    return None

def extract_places_from_users(user_ids, users_df):
    """Extract places visited by a group of users."""
    place_scores = defaultdict(float)
    place_counts = defaultdict(int)
    
    for user_id in user_ids:
        user_doc = get_user_by_id(user_id)
        if user_doc:
            places = get_all_user_places(user_doc)
            for place in places:
                if place:  # Skip empty places
                    place_scores[place] += 1.0
                    place_counts[place] += 1
    
    return place_scores, place_counts

def get_recommendations_from_group(
    target_user_id,
    group_user_ids,
    trips_df,
    top_n=7,
    exclude_places=None
):
    """
    Enhanced function to get place recommendations from a group of users.
    Uses both trips data and user visit history for comprehensive recommendations.
    """
    if exclude_places is None:
        exclude_places = []

    if not group_user_ids:
        print(f"No group users found for recommendations")
        return []

    print(f"Getting recommendations from {len(group_user_ids)} users")

    # Get target user's visited places to exclude
    target_user = get_user_by_id(target_user_id)
    target_visited = set()
    if target_user:
        target_visited = get_all_user_places(target_user)
    
    # Normalize exclude places
    exclude_places_norm = set(normalize_place(place) for place in exclude_places)
    all_excluded = target_visited.union(exclude_places_norm)

    place_scores = defaultdict(float)
    
    # Strategy 1: Extract places from user visit history (primary method)
    user_place_scores, user_place_counts = extract_places_from_users(group_user_ids, None)
    
    for place, score in user_place_scores.items():
        if place and place not in all_excluded:
            place_scores[place] += score

    # Strategy 2: Try to extract from trips data if available
    if not trips_df.empty:
        group_trips = trips_df[trips_df['user_id'].isin(group_user_ids)].copy()
        
        if not group_trips.empty:
            # Look for place field in trips data
            place_field = None
            possible_place_fields = ['destination', 'place', 'city', 'location', 'to', 'place_name', 'trip_destination']
            
            for field in possible_place_fields:
                if field in group_trips.columns:
                    place_field = field
                    break
            
            if place_field:
                print(f"Found place field '{place_field}' in trips data")
                group_trips["place_norm"] = group_trips[place_field].apply(normalize_place)
                
                # Add recency scoring if date field exists
                date_field = None
                possible_date_fields = ['updatedAt', 'createdAt', 'trip_date', 'date']
                
                for field in possible_date_fields:
                    if field in group_trips.columns:
                        date_field = field
                        break
                
                if date_field:
                    group_trips["trip_date"] = pd.to_datetime(group_trips[date_field], errors='coerce')
                    min_date = group_trips["trip_date"].min()
                    max_date = group_trips["trip_date"].max()
                    
                    if pd.notna(min_date) and pd.notna(max_date):
                        group_trips["recency"] = group_trips["trip_date"].apply(
                            lambda d: recency_weight(d, min_date, max_date)
                        )
                    else:
                        group_trips["recency"] = 0.5
                else:
                    group_trips["recency"] = 0.5

                # Score places from trips
                for _, row in group_trips.iterrows():
                    place = row["place_norm"]
                    if place and place not in all_excluded:
                        place_scores[place] += 1.0 + row.get("recency", 0.5)

    # If still no places found, try a broader approach
    if not place_scores:
        print("No places found from primary methods, trying broader approach...")
        
        # Get all users and their places as backup
        all_users_places = defaultdict(int)
        try:
            all_users = list(users_collection.find({}))
            for user_doc in all_users:
                user_id = str(user_doc['_id']).strip().lower()
                if user_id in group_user_ids:
                    places = get_all_user_places(user_doc)
                    for place in places:
                        if place and place not in all_excluded:
                            all_users_places[place] += 1
        except Exception as e:
            print(f"Error in broader approach: {e}")
        
        for place, count in all_users_places.items():
            place_scores[place] += count

    # Rank and return top places
    if place_scores:
        ranked_places = sorted(place_scores.items(), key=lambda x: x[1], reverse=True)
        recommendations = [place for place, score in ranked_places[:top_n] if place]
        print(f"Generated {len(recommendations)} recommendations from data")
        return recommendations
    
    print("No data-driven recommendations found")
    return []

def get_fallback_recommendations(exclude_places=None, count=7):
    """
    Returns random fallback recommendations when no data-driven recommendations are available.
    """
    if exclude_places is None:
        exclude_places = []
    
    # Normalize exclude_places for comparison
    exclude_places_norm = [normalize_place(place) for place in exclude_places if place]
    
    # Filter out excluded places
    available_places = [place for place in FALLBACK_RECOMMENDATIONS
                       if normalize_place(place) not in exclude_places_norm]
    
    # Return random selection
    if available_places:
        return random.sample(available_places, min(count, len(available_places)))
    return []

# --- Flask Application ---
app = Flask(__name__)

@app.route('/recommend_cities', methods=['GET'])
def recommend_cities_route():
    """
    API endpoint to get city recommendations for a user.
    """
    user_oid_str = request.args.get('id', '').strip().lower()
    if not user_oid_str:
        return jsonify({"error": "Missing user ID parameter"}), 400

    try:
        user_oid = ObjectId(user_oid_str)
    except Exception:
        return jsonify({"error": "Invalid user ID format"}), 400

    # 1. Check if user exists
    user = get_user_by_id(user_oid_str)
    if user is None:
        return jsonify({"error": "User ID not found"}), 404

    # 2. Fetch all data
    users_df = fetch_users_df()
    trips_df = fetch_trips_df()

    # 3. Extract user information
    user['_id'] = str(user['_id']).strip().lower()
    user_age = user.get('age')
    user_city = normalize_place(user.get('city', ''))
    user_recent_place = normalize_place(get_recently_visited_places(user, trips_df) or '')
    user_visited_places = get_all_user_places(user)

    top_n = 7
    
    # Debug information
    print(f"\n=== RECOMMENDATION DEBUG ===")
    print(f"User ID: {user['_id']}")
    print(f"User age: {user_age}")
    print(f"User city: {user_city}")
    print(f"User recent place: {user_recent_place}")
    print(f"User visited places: {user_visited_places}")
    print(f"Users DF shape: {users_df.shape}")
    print(f"Trips DF shape: {trips_df.shape}")

    # Strategy 1: Similar Age Group
    sec1 = []
    if user_age is not None and not users_df.empty:
        age_window = 5
        similar_age_users = users_df[
            (users_df['age'].notna()) &
            (users_df['age'].between(user_age - age_window, user_age + age_window)) &
            (users_df['_id'] != user['_id'])
        ]
        sim_age_ids = similar_age_users['_id'].tolist()
        print(f"Similar age users found: {len(sim_age_ids)}")
        
        if sim_age_ids:
            sec1 = get_recommendations_from_group(
                user['_id'], sim_age_ids, trips_df,
                top_n=top_n, exclude_places=list(user_visited_places)
            )

    # Strategy 2: Co-visitation (users who visited same places)
    sec2 = []
    if user_visited_places and not users_df.empty:
        co_visitor_ids = []
        
        try:
            all_users = list(users_collection.find({}))
            for other_user_doc in all_users:
                other_user_id = str(other_user_doc['_id']).strip().lower()
                if other_user_id == user['_id']:
                    continue
                
                other_places = get_all_user_places(other_user_doc)
                
                # Check if there's overlap in visited places
                if user_visited_places.intersection(other_places):
                    co_visitor_ids.append(other_user_id)
        
        except Exception as e:
            print(f"Error finding co-visitors: {e}")
        
        print(f"Co-visitor users found: {len(co_visitor_ids)}")
        
        if co_visitor_ids:
            sec2 = get_recommendations_from_group(
                user['_id'], co_visitor_ids, trips_df,
                top_n=top_n, exclude_places=list(user_visited_places) + sec1
            )

    # Strategy 3: Same City
    sec3 = []
    if user_city and not users_df.empty:
        same_city_users = users_df[
            (users_df['city'].apply(normalize_place) == user_city) &
            (users_df['_id'] != user['_id'])
        ]
        same_city_ids = same_city_users['_id'].tolist()
        print(f"Same city users found: {len(same_city_ids)}")
        
        if same_city_ids:
            sec3 = get_recommendations_from_group(
                user['_id'], same_city_ids, trips_df,
                top_n=top_n, exclude_places=list(user_visited_places) + sec1 + sec2
            )

    print(f"\nData-driven recommendations:")
    print(f"Age-based: {len(sec1)} - {sec1}")
    print(f"Co-visitation: {len(sec2)} - {sec2}")
    print(f"Same city: {len(sec3)} - {sec3}")

    # Only use fallbacks if absolutely no data-driven recommendations found
    total_data_recs = len(sec1) + len(sec2) + len(sec3)
    
    if total_data_recs == 0:
        print("\nNo data-driven recommendations found, using fallbacks")
        fallback_recs = get_fallback_recommendations(
            exclude_places=list(user_visited_places), count=21
        )
        
        sec1 = fallback_recs[:7] if len(fallback_recs) >= 7 else fallback_recs
        sec2 = fallback_recs[7:14] if len(fallback_recs) >= 14 else []
        sec3 = fallback_recs[14:21] if len(fallback_recs) >= 21 else []
    else:
        # Fill empty sections with minimal fallbacks if needed
        all_current_recs = sec1 + sec2 + sec3 + list(user_visited_places)
        
        if not sec1 and total_data_recs < 7:
            sec1 = get_fallback_recommendations(exclude_places=all_current_recs, count=2)
        if not sec2 and total_data_recs < 7:
            sec2 = get_fallback_recommendations(exclude_places=all_current_recs + sec1, count=2)
        if not sec3 and total_data_recs < 7:
            sec3 = get_fallback_recommendations(exclude_places=all_current_recs + sec1 + sec2, count=2)

    print(f"\nFinal recommendations:")
    print(f"Age-based: {len(sec1)} - {sec1}")
    print(f"Co-visitation: {len(sec2)} - {sec2}")
    print(f"Same city: {len(sec3)} - {sec3}")
    print(f"Total: {len(sec1) + len(sec2) + len(sec3)}")

    # Format and return the response
    response = {
        "user": {
            "recommendations": {
                "based_on_similar_age_group": sec1,
                "based_on_co_visitation": sec2,
                "based_on_same_city": sec3,
            },
        }
    }
    return jsonify(response)

@app.route('/', methods=["GET"])
def home():
    return 'Hello from the recommendation backend!'

@app.route('/debug', methods=['GET'])
def debug_data():
    """Debug endpoint to check data structure"""
    try:
        users_df = fetch_users_df()
        trips_df = fetch_trips_df()
        
        # Get sample user with places
        sample_user = None
        if not users_df.empty:
            for _, user_row in users_df.head(5).iterrows():
                user_doc = get_user_by_id(user_row['_id'])
                if user_doc and (user_doc.get('placesVisited') or user_doc.get('recentlyVisited')):
                    sample_user = user_doc
                    break
        
        return jsonify({
            "users_count": len(users_df),
            "trips_count": len(trips_df),
            "users_columns": list(users_df.columns) if not users_df.empty else [],
            "trips_columns": list(trips_df.columns) if not trips_df.empty else [],
            "sample_user": sample_user,
            "sample_trip": trips_df.head(1).to_dict('records') if not trips_df.empty else None,
            "sample_user_places": get_all_user_places(sample_user) if sample_user else None
        })
    except Exception as e:
        return jsonify({"error": str(e)})

