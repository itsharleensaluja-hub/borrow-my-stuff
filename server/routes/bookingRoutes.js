import express from "express"
import {
  createBooking, getMyBookings,
  getBookingsForMyItems, updateBookingStatus
} from "../controllers/bookingController.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/", protect, createBooking)
router.get("/mine", protect, getMyBookings)
router.get("/incoming", protect, getBookingsForMyItems)
router.put("/:id", protect, updateBookingStatus)

export default router