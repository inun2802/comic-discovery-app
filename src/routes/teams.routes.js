import { Router } from "express";
import { getAllTeams, getTeamById } from "../controllers/teams.controller.js";

const router = new Router();

router.get("/", getAllTeams);
router.get("/:id", getTeamById);

export default router;