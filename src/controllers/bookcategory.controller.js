import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { BookCategory } from '../models/bookCategory.model.js';
import { validateBookCategory } from '../utils/validation.js';
import { ObjectId } from "mongodb";

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
  const daysafterfine = Number(req.body.daysafterfine);

  const zodValidation = validateBookCategory({ categoryname, fineamount, daysafterfine });
  if (!zodValidation) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: 'Invalid input',
      message: 'Please enter valid data',
    });
    return res.redirect('/book-category');
  }

  if (id) {
    await BookCategory.findByIdAndUpdate(id, { categoryname, fineamount, daysafterfine });
  } else {
    await BookCategory.create({ categoryname, fineamount, daysafterfine });
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

  const bookCategory = await BookCategory.aggregate([
    {
      '$match': {
        '_id': new ObjectId(id)
      }
    }, {
      '$lookup': {
        'from': 'books',
        'localField': '_id',
        'foreignField': 'bookcategory',
        'as': 'books'
      }
    }, {
      '$project': {
        'count': {
          '$size': '$books'
        }
      }
    }
  ]);

  if (bookCategory[0].count) {
    req.session.apiResponse = new ApiResponse(406, {
      alert: true,
      title: "Can't delete this book category.",
      message: "This category already has books assigned to it"
    });
    return res.redirect("/book-category");
  }

  await BookCategory.findById(id).deleteOne();

  req.session.apiResponse = new ApiResponse(200, {
    alert: true,
    title: 'Category was deleted Succesfully',
  });
  return res.redirect('/book-category');
});

export {
  renderBookCategoy,
  renderBookCategoryEdit,
  createOrUpdateCategoy,
  deleteBookCategory,
};
