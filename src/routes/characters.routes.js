import express from "express";
import {
    getAllCharacters,
    getCharacterById,
    getCharacterJumpingPoints,
    getCharacterIssues,
    getCharacterSeries,
    getCharacterKeyIssues,
    getCharacterFirstAppearances,
    getCharacterMajorCrossovers,
    getCharacterSupportingCast,
    getCharacterStoryArcs,
    createCharacter,
} from "../controllers/characters.controller.js";

const router = express.Router();

router.get("/", getAllCharacters);
router.get("/:id", getCharacterById);
router.get("/:id/jumping-points", getCharacterJumpingPoints);
router.get("/:id/issues", getCharacterIssues);
router.get("/:id/series", getCharacterSeries);
router.get("/:id/key-issues", getCharacterKeyIssues);
router.get("/:id/first-appearances", getCharacterFirstAppearances);
router.get("/:id/major-crossovers", getCharacterMajorCrossovers);
router.get("/:id/supporting-cast", getCharacterSupportingCast);
router.get("/:id/story-arcs", getCharacterStoryArcs);
router.post("/", createCharacter);


export default router;