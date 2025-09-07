require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trip");
const flightsRouter = require("./routes/serp");
const cors = require("cors");
const geminiRoutes = require('./routes/gemini');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send(`<html><body><h1>Welcome to GlobeTrotter API</h1></body></html>`);
});
app.use("/auth", authRoutes);
app.use("/api", flightsRouter);
app.use("/trip", tripRoutes);
app.use('/api', geminiRoutes); 
app.use("/newtrip", tripRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
