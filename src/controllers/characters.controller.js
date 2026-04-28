import { prisma } from "../prisma.js";

export async function getAllCharacters(req, res) {
  try {
    const characters = await prisma.character.findMany({
      include: {
        publisher: true,
      },
    });
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

export async function getCharacterSeries(req, res) {
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

    const uniqueSeriesMap = new Map();

    for (const link of links) {
      const series = link.issue?.series;
      if (series && !uniqueSeriesMap.has(series.id)) {
        uniqueSeriesMap.set(series.id, series);
      }
    }

    res.json(Array.from(uniqueSeriesMap.values()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCharacterKeyIssues(req, res) {
  try {
    const links = await prisma.issueCharacter.findMany({
      where: {
        characterId: req.params.id,
        issue: {
          isKeyIssue: true,
        },
      },
      include: {
        issue: {
          include: {
            series: true,
          },
        },
      },
    });

    const issues = links.map((link) => link.issue);

    res.json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCharacterFirstAppearances(req, res) {
  try {
    const links = await prisma.issueCharacter.findMany({
      where: {
        characterId: req.params.id,
        isFirstAppearance: true,
      },
      include: {
        issue: {
          include: {
            series: true,
          },
        },
      },
    });

    const issues = links.map((link) => link.issue);

    res.json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCharacterMajorCrossovers(req, res) {
  try {
    const links = await prisma.issueCharacter.findMany({
      where: {
        characterId: req.params.id,
        issue: {
          isMajorCrossover: true,
        },
      },
      include: {
        issue: {
          include: {
            series: true,
          },
        },
      },
      orderBy: {
        issue: {
          releaseDate: "asc",
        },
      },
    });

    const issues = links.map((link) => link.issue);

    res.json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCharacterSupportingCast(req, res) {
  try {
    const links = await prisma.issueCharacter.findMany({
      where: {
        characterId: req.params.id,
      },
      include: {
        issue: {
          include: {
            characterLinks: {
              include: {
                character: true,
              },
            },
          },
        },
      },
    });

    const supportingMap = new Map();

    for (const link of links) {
      const characterLinks = link.issue?.characterLinks || [];

      for (const relatedLink of characterLinks) {
        const relatedCharacter = relatedLink.character;

        if (!relatedCharacter) continue;
        if (relatedCharacter.id === req.params.id) continue;
        if (relatedLink.role !== "supporting") continue;

        if (!supportingMap.has(relatedCharacter.id)) {
          supportingMap.set(relatedCharacter.id, relatedCharacter);
        }
      }
    }

    res.json(Array.from(supportingMap.values()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCharacterReadingOrder(req, res) {
  try {
    const links = await prisma.issueCharacter.findMany({
      where: {
        characterId: req.params.id,
        issue: {
          isKeyIssue: true,
        },
      },
      include: {
        issue: {
          include: {
            series: true,
          },
        },
      },
      orderBy: {
        issue: {
          releaseDate: "asc",
        },
      },
    });

    const issues = links.map((link) => link.issue);

    res.json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}