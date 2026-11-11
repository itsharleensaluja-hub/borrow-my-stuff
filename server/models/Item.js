import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Electronics",
        "Books",
        "Instruments",
        "Sports",
        "Food",
        "Clothes",
        "Other",
      ],
      required: true,
    },
    type: {
      type: String,
      enum: ["borrow", "sell"],
      required: true,
    },
    price: { type: Number, required: true, min: 0.01 },
    per: { type: String, enum: ["day", "hour", "flat"], default: "day" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostel: { type: String, default: "" },
    available: { type: Boolean, default: true },
    rules: [{ type: String }],
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true },
);

itemSchema.index({ owner: 1 });
itemSchema.index({ category: 1, type: 1, available: 1 });
const Item = mongoose.model("Item", itemSchema);

export default Item;
