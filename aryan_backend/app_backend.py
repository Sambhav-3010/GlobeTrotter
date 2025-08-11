from flask import Flask, request, jsonify
import pandas as pd
from collections import defaultdict

app = Flask(__name__)

# Load data on startup
USERS_FILE = "data/users.csv"
TRIPS_FILE = "data/trips.csv"
users_df = pd.read_csv(USERS_FILE)
trips_df = pd.read_csv(TRIPS_FILE)

# Normalize places
def normalize_place(s):
    return str(s).strip().lower()

# Recency weight function
def recency_weight(date_str, min_date, max_date):
    if pd.isna(date_str):
        return 0.0
    try:
        d = pd.to_datetime(date_str)
        return (d - min_date).days / max((max_date - min_date).days, 1)
    except Exception:
        return 0.0

def get_user_record(user_id):
    user = users_df[users_df['user_id'] == user_id]
    if user.empty:
        return None
    return user.iloc[0]

def get_places_by_similar_age(user_id, window=5, top_n=5, exclude=[]):
    user = get_user_record(user_id)
    if user is None:
        return []
    age_low, age_high = user.age - window, user.age + window
    similar_users = users_df[
        (users_df.age >= age_low) &
        (users_df.age <= age_high) &
        (users_df.user_id != user_id)
    ]
    sim_user_ids = similar_users.user_id.tolist()
    group_trips = trips_df[trips_df.user_id.isin(sim_user_ids)].copy()
    group_trips["place_norm"] = group_trips["place_of_visit"].apply(normalize_place)
    if group_trips.empty:
        return []
    min_date = pd.to_datetime(group_trips["end_date"]).min()
    max_date = pd.to_datetime(group_trips["end_date"]).max()
    group_trips["recency"] = group_trips["end_date"].apply(lambda d: recency_weight(d, min_date, max_date))
    visited_by_user = trips_df[trips_df.user_id == user_id]['place_of_visit'].apply(normalize_place).unique()
    place_scores = defaultdict(float)
    for _, row in group_trips.iterrows():
        p = row["place_norm"]
        if p not in visited_by_user and p not in exclude:
            place_scores[p] += 1.0 + row["recency"]
    ranked = sorted(place_scores.items(), key=lambda x: -x[1])
    return [x[0] for x in ranked[:top_n]]

def get_places_by_recent_visit(user_id, top_n=5, exclude=[]):
    user = get_user_record(user_id)
    if user is None:
        return []
    recent_place = normalize_place(user.recently_visited_place)
    similar_visitors = users_df[
        users_df['recently_visited_place'].apply(normalize_place) == recent_place
    ]
    sim_ids = similar_visitors.user_id.tolist()
    group_trips = trips_df[trips_df.user_id.isin(sim_ids)].copy()
    if group_trips.empty:
        return []
    group_trips["place_norm"] = group_trips["place_of_visit"].apply(normalize_place)
    min_date = pd.to_datetime(group_trips["end_date"]).min()
    max_date = pd.to_datetime(group_trips["end_date"]).max()
    group_trips["recency"] = group_trips["end_date"].apply(lambda d: recency_weight(d, min_date, max_date))
    visited_by_user = trips_df[trips_df.user_id == user_id]['place_of_visit'].apply(normalize_place).unique()
    place_scores = defaultdict(float)
    for _, row in group_trips.iterrows():
        p = row["place_norm"]
        if p != recent_place and p not in visited_by_user and p not in exclude:
            place_scores[p] += 1.0 + row["recency"]
    ranked = sorted(place_scores.items(), key=lambda x: -x[1])
    return [x[0] for x in ranked[:top_n]]

def get_places_by_city(user_id, top_n=5, exclude=[]):
    user = get_user_record(user_id)
    if user is None:
        return []
    city = user.city_of_residence
    same_city_users = users_df[(users_df.city_of_residence == city) & (users_df.user_id != user_id)]
    city_ids = same_city_users.user_id.tolist()
    group_trips = trips_df[trips_df.user_id.isin(city_ids)].copy()
    if group_trips.empty:
        return []
    group_trips["place_norm"] = group_trips["place_of_visit"].apply(normalize_place)
    min_date = pd.to_datetime(group_trips["end_date"]).min()
    max_date = pd.to_datetime(group_trips["end_date"]).max()
    group_trips["recency"] = group_trips["end_date"].apply(lambda d: recency_weight(d, min_date, max_date))
    visited_by_user = trips_df[trips_df.user_id == user_id]['place_of_visit'].apply(normalize_place).unique()
    place_scores = defaultdict(float)
    for _, row in group_trips.iterrows():
        p = row["place_norm"]
        if p not in visited_by_user and p not in exclude:
            place_scores[p] += 1.0 + row["recency"]
    ranked = sorted(place_scores.items(), key=lambda x: -x[1])
    return [x[0] for x in ranked[:top_n]]

@app.route('/recommend_cities', methods=['GET'])
def recommend_cities():
    user_id_str = request.args.get('user_id')
    if user_id_str is None or not user_id_str.isdigit():
        return jsonify({"error": "Missing or invalid user_id parameter"}), 400
    user_id = int(user_id_str)
    user = get_user_record(user_id)
    if user is None:
        return jsonify({"error": "User ID not found"}), 404
    top_n = 5
    sec1 = get_places_by_similar_age(user_id, top_n=top_n, exclude=[])
    sec2 = get_places_by_recent_visit(user_id, top_n=top_n, exclude=sec1)
    sec3 = get_places_by_city(user_id, top_n=top_n, exclude=sec1 + sec2)
    result = {
        "user": {
        "recommendations": {
            "similar_age_group": sec1,
            "co_visitation": sec2,
            "same_city": sec3
        }}
    }
    return jsonify(result)

@app.route('/', methods=["GET"])
def home():
    return 'Hello from backend'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, threaded=True)
