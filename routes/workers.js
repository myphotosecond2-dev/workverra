import express from "express";
import {
  searchWorkers,
  getWorkers,
  getWorkerById,
  updateWorkerProfile,
} from "../controllers/workerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", searchWorkers);       // GET /api/workers/search?q=&skill=&city=
router.get("/", getWorkers);               // GET /api/workers
router.get("/:id", getWorkerById);         // GET /api/workers/:id
router.put("/profile", protect, updateWorkerProfile); // PUT /api/workers/profile

export default router;
