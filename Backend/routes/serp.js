const express = require("express");
const fetch = require("node-fetch");
const { getJson } = require("serpapi");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router.post(
  "/flights",
  asyncHandler(async (req, res) => {
    const { arrival_id, outbound_date, return_date, departure_id } = req.body;

    const json = await getJson({
      engine: "google_flights",
      departure_id,
      arrival_id,
      outbound_date,
      return_date,
      currency: "INR",
      hl: "en",
      api_key: process.env.SERP_API_KEY,
    });
    res.status(200).send(json);
  })
);

router.get(
  "/trains",
  asyncHandler(async (req, res) => {
    const { from, to } = req.query; // Changed from req.body to req.query
    const url = `https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${from}&toStationCode=${to}`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY, // Use environment variable
        "x-rapidapi-host": "irctc1.p.rapidapi.com",
      },
    };

    const response = await fetch(url, options);
    const result = await response.json(); // Assuming JSON response
    res.status(200).json(result); // Send the result back
  })
);

router.get(
  "/trainfare",
  asyncHandler(async (req, res) => {
    const { trainno, FromSt, ToSt } = req.query; // Changed from req.body to req.query
    const url = `https://irctc1.p.rapidapi.com/api/v2/getFare?trainNo=${trainno}&fromStationCode=${FromSt}&toStationCode=${ToSt}`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY, // Use environment variable
        "x-rapidapi-host": "irctc1.p.rapidapi.com",
      },
    };

    const response = await fetch(url, options);
    const result = await response.json(); // Assuming JSON response
    res.status(200).json(result); // Send the result back
  })
);

router.post(
  "/hotels",
  asyncHandler(async (req, res) => {
    const { q, check_in_date, check_out_date, adults } = req.body;

    const json = await getJson({
      engine: "google_hotels",
      q,
      check_in_date,
      check_out_date,
      adults,
      currency: "INR",
      gl: "us",
      hl: "en",
      api_key: process.env.SERP_API_KEY,
    });
    res.status(200).send(json);
  })
);

router.post(
  "/localplaces",
  asyncHandler(async (req, res) => {
    const { q, location } = req.body;

    const json = await getJson({
      engine: "google_local",
      q,
      location,
      api_key: process.env.SERP_API_KEY,
    });
    res.status(200).send(json);
  })
);

router.get(
  "/maps",
  asyncHandler(async (req, res) => {
    const { start_addr, end_addr } = req.query; // Changed from req.body to req.query

    const json = await getJson({
      engine: "google_maps_directions",
      start_addr,
      end_addr,
      api_key: process.env.SERP_API_KEY,
    });
    res.status(200).send(json);
  })
);

module.exports = router;
