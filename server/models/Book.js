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
    description: {
      type: String,
    },
    year: {
      type: Number,
    },
    genre: {
      type: String,
    },
    available: {
      type: Boolean,
      default: true,
    },

    // Кто взял книгу
    borrowedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Когда взяли
    borrowedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;