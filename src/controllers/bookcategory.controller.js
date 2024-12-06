import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { BookCategory } from '../models/bookCategory.model.js';
import { validateBookCategory } from '../utils/validation.js';

//RENDER CATEGORY
const renderBookCategoy = asyncHandler(async (req, res) => {
  const bookCategories = await BookCategory.find();

  let apiResponse;
  if (req.session.apiResponse) {
    apiResponse = JSON.parse(JSON.stringify(req.session.apiResponse));
    req.session.apiResponse = null;
    apiResponse.data.bookCategories = bookCategories;
  } else {
    apiResponse = new ApiResponse(200, { alert: false, bookCategories });
  }
  return res
    .status(apiResponse.statuscode)
    .render('book-category/', { apiResponse });
});

//RENDER CATEGORY-EDIT
const renderBookCategoryEdit = asyncHandler(async (req, res) => {
  const categoryId = req.body.id;

  if (!categoryId) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: 'Invalid data',
      message: "Can't find the category",
    });
    return res.redirect('/book-category');
  }

  const bookCategory = await BookCategory.findById(categoryId);

  if (!bookCategory) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: 'Invalid data',
      message: "Can't find the category",
    });
    return res.redirect('/book-category');
  }

  res.status(200).render('book-category/book-category-edit', {
    apiResponse: new ApiResponse(200, {
      alert: false,
      bookCategory,
    }),
  });
});

//CREATE OR EDIT CATEGORY
const createOrUpdateCategoy = asyncHandler(async (req, res) => {
  const { id, categoryname } = req.body;
  const fineamount = Number(req.body.fineamount);
  
  const zodValidation = validateBookCategory({ categoryname, fineamount });
  if (!zodValidation) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: 'Invalid input',
      message: 'Please enter valid data',
    });
    return res.redirect('/book-category');
  }

  if (id) {
    await BookCategory.findByIdAndUpdate(id, { categoryname, fineamount });
  } else {
    await BookCategory.create({ categoryname, fineamount });
  }

  req.session.apiResponse = new ApiResponse(200, {
    alert: true,
    title: id
      ? 'Category updated successfully'
      : 'Category created successfully',
    message: '',
  });
  return res.redirect('/book-category');
});

//DELETE CATEGORY
const deleteBookCategory = asyncHandler(async (req, res) => {
  const id = req.body.id;

  await BookCategory.findById(id).deleteOne();

  const bookCategories = await BookCategory.find();

  req.session.apiResponse = new ApiResponse(200, {
    alert: true,
    title: 'Category was deleted Succesfully',
    bookCategories,
  });
  return res.redirect('/book-category');
});

export {
  renderBookCategoy,
  renderBookCategoryEdit,
  createOrUpdateCategoy,
  deleteBookCategory,
};
