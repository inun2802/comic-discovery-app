import express from "express";
import { prisma } from "./prisma.js";
import charactersRoutes from "./routes/characters.routes.js";
import publishersRoutes from "./routes/publishers.routes.js";
import issuesRoutes from "./routes/issues.routes.js";
import seriesRoutes from "./routes/series.routes.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Friendly homepage
app.get("/", (req, res) => {
  res.status(200).send("Comic Discovery API is running. Try /health");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "Comic Discovery API is running" });
});

//  routes
app.use("/api/characters", charactersRoutes);
app.use("/api/publishers", publishersRoutes);
app.use("/api/issues", issuesRoutes);
app.use("/api/series", seriesRoutes);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});