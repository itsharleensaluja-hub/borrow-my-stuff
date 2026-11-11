import express from "express"
import {
  getItems, getItemById, createItem,
  updateItem, deleteItem, getMyItems
} from "../controllers/itemController.js"
import protect from "../middleware/authMiddleware.js"
import { uploadItemImages } from "../middleware/uploadMiddleware.js"

const router = express.Router()

router.get("/", getItems)
router.get("/mine", protect, getMyItems)
router.get("/:id", getItemById)
router.post("/", protect, uploadItemImages, createItem)
router.put("/:id", protect, uploadItemImages, updateItem)
router.delete("/:id", protect, deleteItem)

export default router