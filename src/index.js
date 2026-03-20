import express from "express";
import { prisma } from "./prisma.js";
import charactersRoutes from "./routes/characters.routes.js";

const app = express();
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

// Character routes
app.use("/api/characters", charactersRoutes);

app.get("/api/seed-more", async (req, res) => {
  try {
    const now = new Date();

    const series = await prisma.series.upsert({
      where: {
        publisherId_title: {
          publisherId: "marvel",
          title: "The Amazing Spider-Man",
        },
      },
      update: {
        updatedAt: now,
      },
      create: {
        id: "asm",
        title: "The Amazing Spider-Man",
        publisherId: "marvel",
        updatedAt: now,
      },
    });

    const issue = await prisma.issue.create({
      data: {
        id: "asm-1",
        seriesId: series.id,
        issueNumber: "1",
        title: "Spider-Man / Spider-Man Vs. the Chameleon",
        releaseDate: new Date("1963-03-01"),
        updatedAt: now,
      },
    });

    await prisma.issueCharacter.create({
      data: {
        issueId: issue.id,
        characterId: "spiderman",
        role: "main",
      },
    });

    const jumping = await prisma.jumpingOffPoint.create({
      data: {
        id: "spiderman-jop-1",
        characterId: "spiderman",
        title: "Best Starting Point",
        blurb: "A classic Spider-Man entry point.",
        tier: "S",
        order: 1,
        updatedAt: now,
      },
    });

    res.json({
      ok: true,
      series,
      issue,
      jumping,
    });
  } catch (error) {
    console.error("SEED MORE ERROR:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

app.get("/api/test-seed", async (req, res) => {
  try {
    const now = new Date();

    const publisher = await prisma.publisher.upsert({
      where: { name: "Marvel" },
      update: {
        updatedAt: now,
      },
      create: {
        id: "marvel",
        name: "Marvel",
        updatedAt: now,
      },
    });

    const character = await prisma.character.upsert({
      where: {
        publisherId_name: {
          publisherId: publisher.id,
          name: "Spider-Man",
        },
      },
      update: {
        description: "Friendly neighborhood Spider-Man",
        updatedAt: now,
      },
      create: {
        id: "spiderman",
        name: "Spider-Man",
        description: "Friendly neighborhood Spider-Man",
        publisherId: publisher.id,
        updatedAt: now,
      },
    });

    res.json({ ok: true, publisher, character });
  } catch (error) {
    console.error("TEST SEED ERROR:", error);
    res.status(500).json({
      ok: false,
      message: error.message,
      code: error.code || null,
      meta: error.meta || null,
    });
  }
});

app.post("/api/publishers", async (req, res) => {
  try {
    const { id, name } = req.body;

    if (!id || !name) {
      return res.status(400).json({
        error: "id and name are required",
      });
    }

    const publisher = await prisma.publisher.create({
      data: {
        id,
        name,
        updatedAt: new Date(),
      },
    });

    res.status(201).json(publisher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});