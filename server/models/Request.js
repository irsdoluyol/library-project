import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxLength: 2000,
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "closed"],
      default: "new",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);

export default Request;
