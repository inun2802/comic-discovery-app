import { Router } from "express";
import { getAllStoryArcs, getStoryArcById } from "../controllers/storyArcs.controller.js";

const router = new Router();

router.get("/", getAllStoryArcs);
router.get("/:id", getStoryArcById);

export default router;