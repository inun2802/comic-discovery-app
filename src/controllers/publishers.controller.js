import { prisma } from "../prisma.js";

export async function createPublisher(req, res) {
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
}

export async function getAllPublishers(req, res) {
  try {
    const publishers = await prisma.publisher.findMany();
    res.json(publishers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}