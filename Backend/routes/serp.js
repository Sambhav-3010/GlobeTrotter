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

module.exports = router;
