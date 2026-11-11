import mongoose from "mongoose";

const gigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Delivery", "Academic", "Other"],
      required: true,
    },
    budget: { type: Number, required: true, min: 0.01 },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    hostel: { type: String, default: "" },
    urgency: {
      type: String,
      enum: ["urgent", "today", "scheduled"],
      default: "today",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "cancelled"],
      default: "open",
    },
  },
  { timestamps: true },
);

const Gig = mongoose.model("Gig", gigSchema);
export default Gig;
