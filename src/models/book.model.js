import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
      unique: true,
    },
    bookname: {
      type: String,
      required: true,
    },
    bookCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    isIssued: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export const Book = mongoose.model("Book", bookSchema);
