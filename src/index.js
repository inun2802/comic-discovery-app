import express from "express";
import { prisma } from "./prisma.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Friendly homepage
app.get("/", (req, res) => {
  res.status(200).send("Comic Discovery API is running. Try /health");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "Comic Discovery API is running" });
});

app.get("/api/characters", async (req, res, next) => {
  try {
    const characters = await prisma.character.findMany();
    res.json(characters);
  } catch (err) {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
