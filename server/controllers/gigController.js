import Gig from "../models/Gig.js";
import { positiveNumber } from "../middleware/validate.js";

export const getGigs = async (req, res, next) => {
  try {
    const { category } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20),
    );
    let filter = { status: "open" };
    if (category && category !== "All") filter.category = category;
    const gigs = await Gig.find(filter)
      .populate("postedBy", "name hostel")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(gigs);
  } catch (error) {
    next(error);
  }
};

export const createGig = async (req, res, next) => {
  try {
    const { title, description, category, budget, hostel, urgency } = req.body;
    if (!title || !description || !category || !budget) {
      return res
        .status(400)
        .json({ success: false, code: "MISSING_FIELDS", message: "Please fill all required fields" });
    }
    const normalizedBudget = positiveNumber(budget, "budget");
    const gig = await Gig.create({
      title,
      description,
      category,
      budget: normalizedBudget,
      hostel,
      urgency,
      postedBy: req.user._id,
    });
    const populated = await gig.populate("postedBy", "name hostel");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const acceptGig = async (req, res, next) => {
  try {
    const gig = await Gig.findOneAndUpdate(
      { _id: req.params.id, status: "open", postedBy: { $ne: req.user._id } },
      { $set: { acceptedBy: req.user._id, status: "in-progress" } },
      { new: true },
    );
    if (!gig)
      return res
        .status(409)
        .json({
          success: false,
          code: "GIG_UNAVAILABLE",
          message: "Gig is unavailable or cannot be accepted",
        });
    res.json(gig);
  } catch (error) {
    next(error);
  }
};

export const completeGig = async (req, res, next) => {
  try {
    const gig = await Gig.findOne({
      _id: req.params.id,
      status: "in-progress",
    });
    if (!gig) return res.status(404).json({ success: false, code: "GIG_NOT_FOUND", message: "Gig not found" });
    if (gig.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          code: "FORBIDDEN",
          message: "Only the poster can mark as complete",
        });
    }
    gig.status = "completed";
    await gig.save();
    res.json(gig);
  } catch (error) {
    next(error);
  }
};

export const getMyGigs = async (req, res, next) => {
  try {
    const posted = await Gig.find({ postedBy: req.user._id }).sort({
      createdAt: -1,
    });
    const accepted = await Gig.find({ acceptedBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ posted, accepted });
  } catch (error) {
    next(error);
  }
};
