import express from "express";
import {
  getAllCharacters,
  getCharacterById,
  getCharacterJumpingPoints,
  getCharacterIssues,
  createCharacter,
} from "../controllers/characters.controller.js";

const router = express.Router();

router.get("/", getAllCharacters);
router.get("/:id", getCharacterById);
router.get("/:id/jumping-points", getCharacterJumpingPoints);
router.get("/:id/issues", getCharacterIssues);
router.post("/", createCharacter);

export default router;