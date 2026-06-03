import { prisma } from "../prisma.js";

export async function getAllCreators(req, res) {
  try {
    const creators = await prisma.creator.findMany({
      orderBy: { name: "asc" },
      include: {
        issueLinks: {
          select: { role: true },
          distinct: ["role"],
        },
      },
    });

    // Tag each creator with their roles
    const tagged = creators.map(cr => ({
      ...cr,
      roles: [...new Set(cr.issueLinks.map(l => l.role))],
    }));

    res.json(tagged);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCreatorById(req, res) {
  try {
    const creator = await prisma.creator.findUnique({
      where: { id: req.params.id },
      include: {
        issueLinks: {
          include: {
            issue: {
              include: { series: true },
            },
          },
          orderBy: [{ role: "asc" }],
        },
      },
    });

    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }

    // Group by role then by series
    const byRole = {};
    for (const link of creator.issueLinks) {
      const role = link.role;
      const seriesTitle = link.issue?.series?.title || link.issue?.seriesId || "Unknown";
      if (!byRole[role]) byRole[role] = {};
      if (!byRole[role][seriesTitle]) byRole[role][seriesTitle] = [];
      byRole[role][seriesTitle].push(link.issue?.issueNumber);
    }

    res.json({ ...creator, byRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCreatorRuns(req, res) {
  try {
    const links = await prisma.issueCreator.findMany({
      where: { creatorId: req.params.id },
      include: {
        issue: { include: { series: true } },
      },
      orderBy: [{ role: "asc" }],
    });
    res.json(links);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}