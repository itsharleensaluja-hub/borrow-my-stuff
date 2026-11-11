import mongoose from "mongoose"

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["Electronics", "Books", "Instruments", "Sports", "Food", "Clothes", "Other"],
    required: true,
  },
  type: {
    type: String,
    enum: ["borrow", "sell"],
    required: true,
  },
  price: { type: Number, required: true, min: 0.01 },
  per: { type: String, enum: ["day", "hour", "flat"], default: "day" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hostel: { type: String, default: "" },
  available: { type: Boolean, default: true },
  rules: [{ type: String }],
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: "" },
  }],
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
}, { timestamps: true })

const Item = mongoose.model("Item", itemSchema)

export default Item
