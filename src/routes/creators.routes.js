import express from "express";
import {
  getAllCreators,
  getCreatorById,
  getCreatorRuns,
} from "../controllers/creators.controller.js";

const router = express.Router();

router.get("/", getAllCreators);
router.get("/:id", getCreatorById);
router.get("/:id/runs", getCreatorRuns);

export default router;