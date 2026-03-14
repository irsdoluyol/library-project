import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    surname: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;