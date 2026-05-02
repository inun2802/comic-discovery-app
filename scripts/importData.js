import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../src/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");

async function readJson(filename) {
  const filePath = path.join(dataDir, filename);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function readJsonOptional(filename) {
  try {
    const filePath = path.join(dataDir, filename);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function readJsonFromDirs(filename) {
  const entries = await fs.readdir(dataDir, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  
  let results = [];
  
  // read from root data dir first
  try {
    const root = await readJson(filename);
    results = results.concat(root);
  } catch {}

  // then read from each character/series subdirectory
  for (const dir of dirs) {
    try {
      const filePath = path.join(dataDir, dir, filename);
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);
      results = results.concat(data);
    } catch {}
  }

  return results;
}

async function main() {
  const now = new Date();

  const publishers      = await readJson("publishers.json");
  const characters      = await readJson("characters.json");
  const series          = await readJson("series.json");
  const issues           = await readJsonFromDirs("issues.json");
  const jumpingOffPoints = await readJsonFromDirs("jumpingOffPoints.json");
  const issueCharacters  = await readJsonFromDirs("issueCharacters.json");
  const teams            = await readJsonFromDirs("teams.json");
  const teamMembers      = await readJsonFromDirs("teamMembers.json");
  const issueTeams       = await readJsonFromDirs("issueTeams.json");
  const storyArcs        = await readJsonFromDirs("storyArcs.json");
  const storyArcIssues   = await readJsonFromDirs("storyArcIssues.json");

  for (const publisher of publishers) {
    await prisma.publisher.upsert({
      where: { name: publisher.name },
      update: { name: publisher.name, updatedAt: now },
      create: { id: publisher.id, name: publisher.name, updatedAt: now },
    });
  }

  for (const character of characters) {
    await prisma.character.upsert({
      where: { publisherId_name: { publisherId: character.publisherId, name: character.name } },
      update: { description: character.description ?? null, updatedAt: now },
      create: {
        id: character.id,
        name: character.name,
        description: character.description ?? null,
        publisherId: character.publisherId,
        updatedAt: now,
      },
    });
  }

  for (const item of series) {
    await prisma.series.upsert({
      where: { publisherId_title: { publisherId: item.publisherId, title: item.title } },
      update: { updatedAt: now },
      create: { id: item.id, title: item.title, publisherId: item.publisherId, updatedAt: now },
    });
  }

  for (const issue of issues) {
    await prisma.issue.upsert({
      where: { id: issue.id },
      update: {
        issueNumber: issue.issueNumber ?? null,
        title: issue.title ?? null,
        releaseDate: issue.releaseDate ? new Date(issue.releaseDate) : null,
        universe: issue.universe ?? "main",
        isFirstAppearance: issue.isFirstAppearance ?? false,
        isMajorCrossover: issue.isMajorCrossover ?? false,
        isKeyIssue: issue.isKeyIssue ?? false,
        updatedAt: now,
      },
      create: {
        id: issue.id,
        seriesId: issue.seriesId,
        issueNumber: issue.issueNumber ?? null,
        title: issue.title ?? null,
        releaseDate: issue.releaseDate ? new Date(issue.releaseDate) : null,
        universe: issue.universe ?? "main",
        isFirstAppearance: issue.isFirstAppearance ?? false,
        isMajorCrossover: issue.isMajorCrossover ?? false,
        isKeyIssue: issue.isKeyIssue ?? false,
        updatedAt: now,
      },
    });
  }

  for (const point of jumpingOffPoints) {
    await prisma.jumpingOffPoint.upsert({
      where: { id: point.id },
      update: { title: point.title, blurb: point.blurb ?? null, tier: point.tier ?? null, order: point.order ?? 0, updatedAt: now },
      create: {
        id: point.id,
        characterId: point.characterId,
        title: point.title,
        blurb: point.blurb ?? null,
        tier: point.tier ?? null,
        order: point.order ?? 0,
        updatedAt: now,
      },
    });
  }

  for (const link of issueCharacters) {
    try {
      await prisma.issueCharacter.upsert({
        where: { issueId_characterId: { issueId: link.issueId, characterId: link.characterId } },
        update: { role: link.role ?? null, isFirstAppearance: link.isFirstAppearance ?? false },
        create: {
          issueId: link.issueId,
          characterId: link.characterId,
          role: link.role ?? null,
          isFirstAppearance: link.isFirstAppearance ?? false,
        },
      });
  } catch (e) {
      console.error(`Failed on issueId: ${link.issueId}, characterId: ${link.characterId}`);
      throw e;
    }  
  }

  // ── TEAMS ──
  for (const team of teams) {
    await prisma.team.upsert({
      where: { publisherId_name: { publisherId: team.publisherId, name: team.name } },
      update: { description: team.description ?? null, updatedAt: now },
      create: {
        id: team.id,
        name: team.name,
        description: team.description ?? null,
        publisherId: team.publisherId,
        updatedAt: now,
      },
    });
  }

  for (const member of teamMembers) {
    await prisma.teamMember.upsert({
      where: { teamId_characterId: { teamId: member.teamId, characterId: member.characterId } },
      update: {},
      create: { teamId: member.teamId, characterId: member.characterId },
    });
  }

  for (const link of issueTeams) {
    await prisma.issueTeam.upsert({
      where: { issueId_teamId: { issueId: link.issueId, teamId: link.teamId } },
      update: { role: link.role ?? null },
      create: { issueId: link.issueId, teamId: link.teamId, role: link.role ?? null },
    });
  }

  // ── STORY ARCS ──
  for (const arc of storyArcs) {
    await prisma.storyArc.upsert({
      where: { publisherId_title: { publisherId: arc.publisherId, title: arc.title } },
      update: { description: arc.description ?? null, updatedAt: now },
      create: {
        id: arc.id,
        title: arc.title,
        description: arc.description ?? null,
        publisherId: arc.publisherId,
        updatedAt: now,
      },
    });
  }

  for (const link of storyArcIssues) {
    await prisma.storyArcIssue.upsert({
      where: { storyArcId_issueId: { storyArcId: link.storyArcId, issueId: link.issueId } },
      update: { order: link.order ?? 0 },
      create: { storyArcId: link.storyArcId, issueId: link.issueId, order: link.order ?? 0 },
    });
  }

  console.log("Import complete.");
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });