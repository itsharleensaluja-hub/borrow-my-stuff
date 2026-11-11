import Item from "../models/Item.js"
import { positiveNumber } from "../middleware/validate.js"
import { getUploadUrl, removeUploadedFile } from "../middleware/uploadMiddleware.js"
import { AppError } from "../middleware/errorMiddleware.js"

const parseRules = (rules) => {
  if (typeof rules !== "string") return rules
  try {
    const parsed = JSON.parse(rules || "[]")
    if (!Array.isArray(parsed) || parsed.some((rule) => typeof rule !== "string")) throw new Error("Rules must be an array of text values")
    return parsed
  } catch {
    throw new AppError("Rules must be a valid list", 400, "INVALID_RULES")
  }
}

export const getItems = async (req, res, next) => {
  try {
    const { category, type, search } = req.query
    let filter = {}
    if (category && category !== "All") filter.category = category
    if (type && type !== "All") filter.type = type
    if (search) filter.title = { $regex: search, $options: "i" }
    const items = await Item.find(filter).populate("owner", "name hostel rating")
    res.json(items)
  } catch (error) { next(error) }
}

export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate("owner", "name hostel rating email")
    if (!item) return res.status(404).json({ message: "Item not found" })
    res.json(item)
  } catch (error) { next(error) }
}

export const createItem = async (req, res, next) => {
  try {
    const { title, description, category, type, price, per, hostel, rules } = req.body
    if (!title || !description || !category || !type || !price) {
      return res.status(400).json({ message: "Please fill all required fields" })
    }
    const normalizedPrice = positiveNumber(price, "price")
    const images = (req.files || []).map((file) => ({ url: getUploadUrl(file.filename), alt: title.trim() }))
    const item = await Item.create({
      title, description, category, type,
      price: normalizedPrice, per, hostel, rules: parseRules(rules),
      images,
      owner: req.user._id,
    })
    const populated = await item.populate("owner", "name hostel rating")
    res.status(201).json(populated)
  } catch (error) {
    if (req.files?.length) await Promise.all(req.files.map((file) => removeUploadedFile(getUploadUrl(file.filename))))
    next(error)
  }
}

export const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ message: "Item not found" })
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" })
    }
    const allowedFields = ["title", "description", "category", "type", "price", "per", "hostel", "available", "rules"]
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
    )
    if (updates.price !== undefined) updates.price = positiveNumber(updates.price, "price")
    if (typeof updates.rules === "string") updates.rules = parseRules(updates.rules)
    if (req.files?.length) {
      await Promise.all((item.images || []).map((image) => removeUploadedFile(image.url)))
      updates.images = req.files.map((file) => ({ url: getUploadUrl(file.filename), alt: updates.title || item.title }))
    }
    const updated = await Item.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
    res.json(updated)
  } catch (error) { next(error) }
}

export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ message: "Item not found" })
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" })
    }
    await Promise.all((item.images || []).map((image) => removeUploadedFile(image.url)))
    await item.deleteOne()
    res.json({ message: "Item deleted" })
  } catch (error) { next(error) }
}

export const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id })
    res.json(items)
  } catch (error) { next(error) }
}