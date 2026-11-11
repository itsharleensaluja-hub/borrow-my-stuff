import Gig from "../models/Gig.js"
import { positiveNumber } from "../middleware/validate.js"

export const getGigs = async (req, res, next) => {
  try {
    const { category } = req.query
    let filter = { status: "open" }
    if (category && category !== "All") filter.category = category
    const gigs = await Gig.find(filter)
      .populate("postedBy", "name hostel rating")
      .sort({ createdAt: -1 })
    res.json(gigs)
  } catch (error) { next(error) }
}

export const createGig = async (req, res, next) => {
  try {
    const { title, description, category, budget, hostel, urgency } = req.body
    if (!title || !description || !category || !budget) {
      return res.status(400).json({ message: "Please fill all required fields" })
    }
    const normalizedBudget = positiveNumber(budget, "budget")
    const gig = await Gig.create({
      title, description, category,
      budget: normalizedBudget, hostel, urgency,
      postedBy: req.user._id,
    })
    const populated = await gig.populate("postedBy", "name hostel rating")
    res.status(201).json(populated)
  } catch (error) { next(error) }
}

export const acceptGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id)
    if (!gig) return res.status(404).json({ message: "Gig not found" })
    if (gig.status !== "open") {
      return res.status(400).json({ message: "Gig is no longer available" })
    }
    if (gig.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot accept your own gig" })
    }
    gig.acceptedBy = req.user._id
    gig.status = "in-progress"
    await gig.save()
    res.json(gig)
  } catch (error) { next(error) }
}

export const completeGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id)
    if (!gig) return res.status(404).json({ message: "Gig not found" })
    if (gig.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Only the poster can mark as complete" })
    }
    gig.status = "completed"
    await gig.save()
    res.json(gig)
  } catch (error) { next(error) }
}

export const getMyGigs = async (req, res, next) => {
  try {
    const posted = await Gig.find({ postedBy: req.user._id }).sort({ createdAt: -1 })
    const accepted = await Gig.find({ acceptedBy: req.user._id }).sort({ createdAt: -1 })
    res.json({ posted, accepted })
  } catch (error) { next(error) }
}