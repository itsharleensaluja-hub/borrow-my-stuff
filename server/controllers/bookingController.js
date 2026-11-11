import Booking from "../models/Booking.js";
import Item from "../models/Item.js";
import mongoose from "mongoose";
import { AppError } from "../middleware/errorMiddleware.js";
import { isValidObjectId } from "../middleware/validate.js";
import { canTransitionBooking } from "../services/bookingState.js";

const isTransactionUnsupported = (error) =>
  error?.code === 20 ||
  error?.code === 251 ||
  /transaction numbers are only allowed|replica set|mongos|transaction not supported/i.test(
    error?.message || "",
  );

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    throw new AppError(
      "A valid date range is required",
      400,
      "INVALID_DATE_RANGE",
    );
  }
  if (start < today) {
    throw new AppError(
      "Booking cannot start in the past",
      400,
      "INVALID_DATE_RANGE",
    );
  }
  return { start, end };
};

export const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { itemId, startDate, endDate } = req.body;
    if (!isValidObjectId(itemId))
      throw new AppError("Invalid itemId", 400, "INVALID_ID");
    const { start, end } = validateDateRange(startDate, endDate);

    session.startTransaction();
    const item = await Item.findOneAndUpdate(
      { _id: itemId, available: true, type: "borrow" },
      { $set: { available: false } },
      { new: true, session },
    );
    if (!item) {
      throw new AppError(
        "Item is unavailable or cannot be booked",
        409,
        "ITEM_UNAVAILABLE",
      );
    }
    if (item.owner.toString() === req.user._id.toString()) {
      throw new AppError(
        "You cannot book your own item",
        403,
        "OWNER_BOOKING_FORBIDDEN",
      );
    }

    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
    const totalPrice =
      item.per === "flat"
        ? item.price
        : item.per === "hour"
          ? hours * item.price
          : days * item.price;

    const [booking] = await Booking.create(
      [
        {
          item: item._id,
          borrower: req.user._id,
          owner: item.owner,
          startDate: start,
          endDate: end,
          totalPrice,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    const populated = await booking.populate([
      { path: "item", select: "title price per" },
      { path: "owner", select: "name hostel" },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (isTransactionUnsupported(error)) {
      return next(
        new AppError(
          "Booking requires a MongoDB replica set or sharded deployment",
          503,
          "TRANSACTIONS_UNAVAILABLE",
        ),
      );
    }
    next(error);
  } finally {
    await session.endSession();
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ borrower: req.user._id })
      .populate("item", "title price per category")
      .populate("owner", "name hostel")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingsForMyItems = async (req, res, next) => {
  try {
    const filter = { owner: req.user._id };
    if (req.query.status && req.query.status !== "all")
      filter.status = req.query.status;
    const bookings = await Booking.find(filter)
      .populate("item", "title price per")
      .populate("borrower", "name hostel email")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    if (!isValidObjectId(req.params.id))
      throw new AppError("Invalid booking id", 400, "INVALID_ID");
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking)
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");

    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isBorrower = booking.borrower.toString() === req.user._id.toString();
    if (!isOwner && !isBorrower)
      throw new AppError("Not authorized", 403, "FORBIDDEN");
    if (!canTransitionBooking(booking.status, status)) {
      throw new AppError(
        `Cannot change booking from ${booking.status} to ${status}`,
        400,
        "INVALID_STATE_TRANSITION",
      );
    }
    if (isBorrower && status !== "cancelled") {
      throw new AppError(
        "Borrowers may only cancel their booking",
        403,
        "FORBIDDEN",
      );
    }

    session.startTransaction();
    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: booking._id, status: booking.status },
      { $set: { status } },
      { new: true, session },
    );
    if (!updatedBooking) {
      throw new AppError(
        "Booking was updated by another request",
        409,
        "BOOKING_CONFLICT",
      );
    }
    if (status === "cancelled" || status === "completed") {
      await Item.findOneAndUpdate(
        { _id: booking.item, owner: booking.owner },
        { $set: { available: true } },
        { session },
      );
    }
    await session.commitTransaction();
    res.json(updatedBooking);
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (isTransactionUnsupported(error)) {
      return next(
        new AppError(
          "Booking updates require a MongoDB replica set or sharded deployment",
          503,
          "TRANSACTIONS_UNAVAILABLE",
        ),
      );
    }
    next(error);
  } finally {
    await session.endSession();
  }
};
