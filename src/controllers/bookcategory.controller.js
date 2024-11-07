import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BookCategory } from "../models/bookCategory.model.js";
import { validateBookCategory } from "../utils/validation.js";

const renderBookCategoy = asyncHandler(async (req, res) => {
  const bookCategories = await BookCategory.find();
  return res.status(200).render("book-category/", { apiResponse: new ApiResponse(200, { alert: false, bookCategories }) });
});

const renderBookCategoryEdit = asyncHandler(async (req, res) => {
  const categoryId = req.body.id;

  const bookCategories = await BookCategory.find();

  if (!categoryId) {
    res
      .status(400)
      .render("book-category/", {
        apiResponse: new ApiResponse(400, {
          alert: true,
          title: "Invalid data",
          message: "Can't find the category",
          bookCategories
        })
      })
  }

  const bookCategory = bookCategories.find(bc => String(bc._id) === String(categoryId));

  if (!bookCategory) {
    res
      .status(400)
      .render("book-category/", {
        apiResponse: new ApiResponse(400, {
          alert: true,
          title: "Invalid data",
          message: "Can't find the category",
          bookCategories
        })
      })
  }

  res.status(200).render("book-category/book-category-edit", {
    apiResponse: new ApiResponse(200, {
      alert: false,
      bookCategory
    })
  });
});

const createOrUpdateCategoy = asyncHandler(async (req, res) => {
  const { id, categoryname } = req.body;
  const zodValidation = validateBookCategory({ categoryname });

  const bookCategories = await BookCategory.find();
  if (!zodValidation) {
    return res.status(400).render("book-category/", {
      apiResponse: new ApiResponse(400, {
        alert: true,
        title: "Invlaid input",
        message: "Please enter valid data",
        bookCategories
      })
    });
  }

  if (id) {
    await BookCategory.findByIdAndUpdate(id, { categoryname });
  } else {
    await BookCategory.create({ categoryname });
  }
  const updatedBookCategories = await BookCategory.find();
  return res.status(200).render("book-category/", {
    apiResponse: new ApiResponse(200, {
      alert: true,
      title: id
        ? "Category updated successfully"
        : "Category created successfully",
      message: "",
      bookCategories: updatedBookCategories,
    })
  });
});

const deleteBookCategory = asyncHandler(async (req, res) => {
  const id = req.body.id;

  await BookCategory.findById(id).deleteOne();

  const bookCategories = await BookCategory.find();
  return res.status(200).render("book-category/", {
    apiResponse: new ApiResponse(200, {
      alert: true,
      title: "Category was deleted Succesfully",
      bookCategories,
    })
  });
});

export { renderBookCategoy, renderBookCategoryEdit, createOrUpdateCategoy, deleteBookCategory };
