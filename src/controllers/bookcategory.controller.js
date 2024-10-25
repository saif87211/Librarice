import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BookCategory } from "../models/bookCategory.model.js";
import { validateBookCategory } from "../utils/validation.js";

const renderBookCategoy = asyncHandler(async (req, res) => {
  const bookCategories = await BookCategory.find();
  const apiReponse = new ApiResponse(200, { alert: false, bookCategories });
  return res.status(200).render("book-category", { apiReponse });
});

const createOrUpdateCategoy = asyncHandler(async (req, res) => {
  const { id, bookCategory } = req.body;
  const zodValidation = validateBookCategory({ bookCategory });
  if (!zodValidation) {
    const apiResponse = new ApiResponse(400, {
      alert: true,
      title: "Invlaid input",
      message: "Please enter valid data",
    });
    return res.status(400).render("book-category", { apiResponse });
  }
  if (id) {
    await BookCategory.findByIdAndUpdate(id, { categoryname: bookCategory });
  } else {
    await BookCategory.create({ categoryname: bookCategory });
  }
  const apiResponse = new ApiResponse(200, {
    alert: true,
    title: id
      ? "Category updated successfully"
      : "Category created successfully",
    message: "",
  });
  return res.status(200).render("book-category", { apiResponse });
});

const deleteBookCategory = asyncHandler(async (req, res) => {
  const _id = req.body._id;

  await BookCategory.findById(_id).deleteOne();

  const apiResponse = new ApiResponse(200, {
    alert: true,
    title: "Entry was deleted Succesfully",
  });
  return res.status(200).render("book-category", { apiResponse });
});

export { renderBookCategoy, createOrUpdateCategoy, deleteBookCategory };
