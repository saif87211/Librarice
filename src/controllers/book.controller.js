import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Book } from "../models/book.model.js";
import { BookCategory } from "../models/bookCategory.model.js"
import { validateBook } from "../utils/validation.js";

//RENDER BOOK
const renderBookPage = asyncHandler(async (req, res) => {
    const books = await Book.find().populate("bookcategory");
    const bookCategories = await BookCategory.find();

    let apiResponse;
    if (req.session.apiResponse) {
        apiResponse = JSON.parse(JSON.stringify(req.session.apiResponse));
        apiResponse.data.books = books;
        apiResponse.data.bookCategories = bookCategories;
        req.session.apiResponse = null;
    } else {
        apiResponse = new ApiResponse(200, { alert: false, books, bookCategories });
    }

    return res.status(apiResponse.statuscode).render("book/", { apiResponse });
});

//RENDER BOOK-EDIT
const renderBookEdit = asyncHandler(async (req, res) => {
    const id = req.body.id;

    if (!id) {
        req.session.apiResponse = new ApiResponse(400, {
            alert: true,
            title: "Invalid input",
            message: "Try again after sometime",
        });
        return res.redirect("book/");
    }

    const books = await Book.find().populate("bookcategory");
    const bookCategories = await BookCategory.find();
    const book = books.find(b => String(b._id) === String(id));

    if (!book) {
        req.session.apiResponse = new ApiResponse(400, {
            alert: true,
            title: "Invalid input",
            message: "Try again after sometime",
        });
        return res.redirect("book/");
    }

    return res.status(200).render("book/book-edit", {
        apiResponse: new ApiResponse(200, {
            alert: false,
            book,
            bookCategories
        })
    });
});

//RENDER OR EDIT BOOK
const createOrUpdateBook = asyncHandler(async (req, res) => {
    const { id, uniqueId, bookname, bookcategory } = req.body;

    const zodValidation = validateBook({ uniqueId, bookname, bookcategory });


    if (!zodValidation) {
        req.session.apiResponse = new ApiResponse(400, {
            alert: true,
            title: "Input data is invalid",
            message: "Try again after some time",
        });
        return res.redirect("/book");
    }

    const category = await BookCategory.findOne({ categoryname: bookcategory });

    if (!category) {
        req.session.apiResponse = new ApiResponse(400, {
            alert: true,
            title: "Input data is invalid",
            message: "Try again after some time"
        });
        return res.redirect("/book");
    }

    if (id) {
        await Book.findByIdAndUpdate(id, { uniqueId, bookname, bookcategory: category._id });
    }
    else {
        await Book.create({ uniqueId, bookname, bookcategory: category._id });
    }

    req.session.apiResponse = new ApiResponse(200, {
        alert: true,
        title: id ? "Book updated succesfully." : "Book added succesfully.",
        message: "",
    });
    return res.redirect("/book");
});

//DELETE
const deleteBook = asyncHandler(async (req, res) => {
    const id = req.body.id;

    await Book.findByIdAndDelete(id);

    req.session.apiResponse = new ApiResponse(200, {
        alert: true,
        title: "Book deleted succesfully",
        message: "",
    });
    return res.redirect("/book");
});
export { renderBookPage, renderBookEdit, createOrUpdateBook, deleteBook };