import { prisma } from "../prisma.js";

export async function getAllTeams(req, res) {
  try {
    const teams = await prisma.team.findMany({
      include: { publisher: true },
    });
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export async function getTeamById(req, res) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        publisher: true,
        members: {
          include: { character: true },
        },
        issueLinks: {
          include: {
            issue: { include: { series: true } },
          },
        },
      },
    });
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}