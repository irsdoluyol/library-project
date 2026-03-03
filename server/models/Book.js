import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    year: Number,
    genre: String,
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", author: "text" });
bookSchema.index({ genre: 1 });

export default mongoose.model("Book", bookSchema);