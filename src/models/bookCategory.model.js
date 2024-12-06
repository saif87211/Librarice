import mongoose from "mongoose";

const bookCategorySchema = new mongoose.Schema(
  {
    categoryname: {
      type: String,
      required: true,
    },
    fineamount: {
      type: Number,
      default: 0,
      required: true,
    }
  },
  { timestamps: true }
);

export const BookCategory = mongoose.model("BookCategory", bookCategorySchema);