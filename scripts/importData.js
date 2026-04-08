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

async function main() {
  const now = new Date();

  const publishers = await readJson("publishers.json");
  const characters = await readJson("characters.json");
  const series = await readJson("series.json");
  const issues = await readJson("issues.json");
  const jumpingOffPoints = await readJson("jumpingOffPoints.json");
  const issueCharacters = await readJson("issueCharacters.json");

  for (const publisher of publishers) {
    await prisma.publisher.upsert({
      where: { name: publisher.name },
      update: {
        name: publisher.name,
        updatedAt: now,
      },
      create: {
        id: publisher.id,
        name: publisher.name,
        updatedAt: now,
      },
    });
  }

  for (const character of characters) {
    await prisma.character.upsert({
      where: {
        publisherId_name: {
          publisherId: character.publisherId,
          name: character.name,
        },
      },
      update: {
        description: character.description ?? null,
        updatedAt: now,
      },
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
      where: {
        publisherId_title: {
          publisherId: item.publisherId,
          title: item.title,
        },
      },
      update: {
        updatedAt: now,
      },
      create: {
        id: item.id,
        title: item.title,
        publisherId: item.publisherId,
        updatedAt: now,
      },
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
      update: {
        title: point.title,
        blurb: point.blurb ?? null,
        tier: point.tier ?? null,
        order: point.order ?? 0,
        updatedAt: now,
      },
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
    await prisma.issueCharacter.upsert({
      where: {
        issueId_characterId: {
          issueId: link.issueId,
          characterId: link.characterId,
        },
      },
      update: {
        role: link.role ?? null,
      },
      create: {
        issueId: link.issueId,
        characterId: link.characterId,
        role: link.role ?? null,
      },
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