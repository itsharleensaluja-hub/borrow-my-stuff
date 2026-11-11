import express from "express"
import {
  getGigs, createGig,
  acceptGig, completeGig, getMyGigs
} from "../controllers/gigController.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", getGigs)
router.get("/mine", protect, getMyGigs)
router.post("/", protect, createGig)
router.put("/:id/accept", protect, acceptGig)
router.put("/:id/complete", protect, completeGig)

export default router