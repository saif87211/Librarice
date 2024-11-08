import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    bookname: {
      type: String,
      required: true,
    },
    bookcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookCategory",
    },
    isIssued: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

export const Book = mongoose.model("Book", bookSchema);
