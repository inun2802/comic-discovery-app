import { prisma } from "../prisma.js";

export async function getAllCharacters(req, res) {
  try {
    const characters = await prisma.character.findMany();
    res.json(characters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCharacterById(req, res) {
  try {
    const character = await prisma.character.findUnique({
      where: { id: req.params.id },
      include: {
        publisher: true,
        jumpingOff: {
          orderBy: { order: "asc" },
        },
        issueLinks: {
          include: {
            issue: {
              include: {
                series: true,
              },
            },
          },
        },
      },
    });

    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }

    res.json(character);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCharacterJumpingPoints(req, res) {
  try {
    const points = await prisma.jumpingOffPoint.findMany({
      where: {
        characterId: req.params.id,
      },
      orderBy: {
        order: "asc",
      },
    });

    res.json(points);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCharacterIssues(req, res) {
  try {
    const links = await prisma.issueCharacter.findMany({
      where: {
        characterId: req.params.id,
      },
      include: {
        issue: {
          include: {
            series: true,
          },
        },
      },
    });

    res.json(links);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function createCharacter(req, res) {
  try {
    const { id, name, description, publisherId } = req.body;

    if (!id || !name || !publisherId) {
      return res.status(400).json({
        error: "id, name, and publisherId are required",
      });
    }

    const character = await prisma.character.create({
      data: {
        id,
        name,
        description: description || null,
        publisherId,
        updatedAt: new Date(),
      },
    });

    res.status(201).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}