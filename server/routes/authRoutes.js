import express from "express"
import { registerUser, loginUser, getMe, logoutUser, updateRoles } from "../controllers/authController.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/me", protect, getMe)
router.put("/roles", protect, updateRoles)
router.post("/logout", logoutUser)

export default router