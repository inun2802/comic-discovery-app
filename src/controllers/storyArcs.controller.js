import { prisma } from "../prisma.js";

export async function getAllStoryArcs(req, res) {
  try {
    const arcs = await prisma.storyArc.findMany({
      include: { publisher: true },
    });
    res.json(arcs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getStoryArcById(req, res) {
  try {
    const arc = await prisma.storyArc.findUnique({
      where: { id: req.params.id },
      include: {
        publisher: true,
        issues: {
          orderBy: { order: "asc" },
          include: {
            issue: {
              include: {
                series: true,
                characterLinks: {
                  where: { isFirstAppearance: true },
                  include: { character: true },
                },
              },
            },
          },
        },
      },
    });
    if (!arc) return res.status(404).json({ error: "Story arc not found" });
    res.json(arc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}