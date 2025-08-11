const express = require("express");
const fetch = require("node-fetch");
const { getJson } = require("serpapi");

const router = express.Router();

router.get("/flights", async (req, res) => {
  const { departure_id, arrival_id, outbound_date, return_date } = req.body;
  try {
    const response = await getJson({
      engine: "google_flights",
      departure_id,
      arrival_id,
      outbound_date,
      return_date,
      currency: "INR",
      hl: "en",
      api_key: process.env.SERP_API_KEY,
    })
      .then((json) => {
        return res.status(200).send(json);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).send({ error: "Failed to fetch flight data" });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/trains", async (req, res) => {
  const {from, to} = req.body;
  const url = `https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${from}&toStationCode=${to}`;
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '99ecbe3010mshe9d0ee011f51b11p1dfca5jsna5d0c783ddb1',
		'x-rapidapi-host': 'irctc1.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}
        return res.status(500).send({ error: "Failed to fetch train data" });
      });

router.get("/trainfare", async (req, res) => {
  const {trainno, FromSt, ToSt} = req.body;
  const url = `https://irctc1.p.rapidapi.com/api/v2/getFare?trainNo=${trainno}&fromStationCode=${FromSt}&toStationCode=${ToSt}`;
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '99ecbe3010mshe9d0ee011f51b11p1dfca5jsna5d0c783ddb1',
		'x-rapidapi-host': 'irctc1.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}
         return res.status(500).send({ error: "Failed to fetch fare data" });
});

router.get("/hotels", async (req, res) => {
  const { q, check_in_date, check_out_date, adults } = req.body;
  try {
    const response = await getJson({
  engine: "google_hotels",
  q,
  check_in_date,
  check_out_date,
  adults,
  currency: "INR",
  gl: "us",
  hl: "en",
  api_key: process.env.SERP_API_KEY,
  })
      .then((json) => {
        return res.status(200).send(json);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).send({ error: "Failed to fetch hotel data" });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/localplaces", async (req, res) => {
  const { q, location } = req.body;
  try {
    const response = await getJson({
  engine: "google_local",
  q,
  location,
  api_key:  process.env.SERP_API_KEY,
})
      .then((json) => {
        return res.status(200).send(json);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).send({ error: "Failed to fetch local places data" });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/maps", async (req, res) => {
  const { start_addr, end_addr} = req.body;
  try {
    const response = await getJson({
  engine: "google_maps_directions",
  start_addr,
  end_addr,
  api_key: process.env.SERP_API_KEY,
})
      .then((json) => {
        return res.status(200).send(json);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).send({ error: "Failed to fetch distance data" });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
