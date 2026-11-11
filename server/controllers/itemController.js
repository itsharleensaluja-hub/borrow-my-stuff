import Item from "../models/Item.js";
import Booking from "../models/Booking.js";
import { positiveNumber } from "../middleware/validate.js";
import {
  getUploadUrl,
  removeUploadedFile,
} from "../middleware/uploadMiddleware.js";
import { AppError } from "../middleware/errorMiddleware.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseRules = (rules) => {
  if (typeof rules !== "string") return rules;
  try {
    const parsed = JSON.parse(rules || "[]");
    if (
      !Array.isArray(parsed) ||
      parsed.some((rule) => typeof rule !== "string")
    )
      throw new Error("Rules must be an array of text values");
    return parsed;
  } catch {
    throw new AppError("Rules must be a valid list", 400, "INVALID_RULES");
  }
};

export const getItems = async (req, res, next) => {
  try {
    const { category, type, search } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20),
    );
    let filter = req.query.all === "true" ? {} : { available: true };
    if (category && category !== "All") filter.category = category;
    if (type && type !== "All") filter.type = type;
    if (search) {
      const expression = { $regex: escapeRegex(search), $options: "i" };
      filter.$or = [{ title: expression }, { description: expression }];
    }
    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate("owner", "name hostel")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Item.countDocuments(filter),
    ]);
    if (req.query.meta === "true") {
      return res.json({
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "owner",
      "name hostel",
    );
    if (!item) return res.status(404).json({ success: false, code: "ITEM_NOT_FOUND", message: "Item not found" });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const { title, description, category, type, price, per, hostel, rules } =
      req.body;
    if (!title || !description || !category || !type || !price) {
      return res
        .status(400)
        .json({ success: false, code: "MISSING_FIELDS", message: "Please fill all required fields" });
    }
    const normalizedPrice = positiveNumber(price, "price");
    const images = (req.files || []).map((file) => ({
      url: getUploadUrl(file.filename),
      alt: title.trim(),
    }));
    const item = await Item.create({
      title,
      description,
      category,
      type,
      price: normalizedPrice,
      per,
      hostel,
      rules: parseRules(rules),
      images,
      owner: req.user._id,
    });
    const populated = await item.populate("owner", "name hostel");
    res.status(201).json(populated);
  } catch (error) {
    if (req.files?.length)
      await Promise.all(
        req.files.map((file) =>
          removeUploadedFile(getUploadUrl(file.filename)),
        ),
      );
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      await cleanupRequestFiles(req);
      return res.status(404).json({ success: false, code: "ITEM_NOT_FOUND", message: "Item not found" });
    }
    if (item.owner.toString() !== req.user._id.toString()) {
      await cleanupRequestFiles(req);
      return res
        .status(403)
        .json({ success: false, code: "FORBIDDEN", message: "Not authorized" });
    }
    const allowedFields = [
      "title",
      "description",
      "category",
      "type",
      "price",
      "per",
      "hostel",
      "available",
      "rules",
    ];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([field]) =>
        allowedFields.includes(field),
      ),
    );
    if (updates.price !== undefined)
      updates.price = positiveNumber(updates.price, "price");
    if (typeof updates.rules === "string")
      updates.rules = parseRules(updates.rules);
    const replacementImages = req.files?.length
      ? req.files.map((file) => ({
          url: getUploadUrl(file.filename),
          alt: updates.title || item.title,
        }))
      : null;
    if (replacementImages) {
      updates.images = replacementImages;
    }
    let updated;
    try {
      updated = await Item.findByIdAndUpdate(req.params.id, updates, {
        returnDocument: "after",
        runValidators: true,
      });
    } catch (error) {
      await cleanupRequestFiles(req);
      throw error;
    }
    if (!updated) {
      await cleanupRequestFiles(req);
      return res.status(404).json({
        success: false,
        code: "ITEM_NOT_FOUND",
        message: "Item not found",
      });
    }
    if (replacementImages) {
      await cleanupStoredFiles(item.images);
    }
    res.json(updated);
  } catch (error) {
    if (req.files?.length) await cleanupRequestFiles(req);
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, code: "ITEM_NOT_FOUND", message: "Item not found" });
    if (item.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, code: "FORBIDDEN", message: "Not authorized" });
    }
    const activeBookingCount = await Booking.countDocuments({
      item: item._id,
      status: { $in: ["pending", "confirmed", "active"] },
    });
    if (activeBookingCount > 0) {
      return res.status(409).json({
        success: false,
        code: "ITEM_HAS_ACTIVE_BOOKINGS",
        message: "Items with active bookings cannot be deleted",
      });
    }
    await item.deleteOne();
    await cleanupStoredFiles(item.images);
    res.json({ message: "Item deleted" });
  } catch (error) {
    next(error);
  }
};

const cleanupStoredFiles = async (images = []) => {
  const results = await Promise.allSettled(
    images.map((image) => removeUploadedFile(image.url)),
  );
  results
    .filter((result) => result.status === "rejected")
    .forEach((result) => console.error("Upload cleanup failed:", result.reason));
};

const cleanupRequestFiles = async (req) =>
  cleanupStoredFiles(
    (req.files || []).map((file) => ({
      url: getUploadUrl(file.filename),
    })),
  );

export const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id });
    res.json(items);
  } catch (error) {
    next(error);
  }
};
