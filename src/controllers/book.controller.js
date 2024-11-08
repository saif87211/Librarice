import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Book } from "../models/book.model.js";
import { BookCategory } from "../models/bookCategory.model.js"
import { validateBook } from "../utils/validation.js";

const renderBookPage = asyncHandler(async (req, res) => {
    const books = await Book.find().populate("bookcategory");
    const bookCategories = await BookCategory.find();

    return res.status(200).render("book/", {
        apiResponse: new ApiResponse(200, { alert: false, books, bookCategories })
    })
});

const renderBookEdit = asyncHandler(async (req, res) => {
    const id = req.body.id;

    const books = await Book.find().populate("bookcategory");
    const bookCategories = await BookCategory.find();

    if (!id) {
        return res.status(400).render("book/", {
            apiResponse: new ApiResponse(400, {
                alert: true,
                title: "Invalid input",
                message: "Try again after sometime",
                books,
                bookCategories
            })
        })
    }

    const book = books.find(b => String(b._id) === String(id));

    if (!book) {
        return res.status(400).render("book/", {
            apiResponse: new ApiResponse(400, {
                alert: true,
                title: "Invalid input",
                message: "Try again after sometime",
                books,
                bookCategories
            })
        })
    }

    return res.status(200).render("book/book-edit", {
        apiResponse: new ApiResponse(200, {
            alert: false,
            book,
            bookCategories
        })
    });
});

const createOrUpdateBook = asyncHandler(async (req, res) => {
    const { id, uniqueId, bookname, bookcategory } = req.body;
    console.log({ id, uniqueId, bookname, bookcategory });
    const zodValidation = validateBook({ uniqueId, bookname, bookcategory });

    const books = await Book.find().populate("bookcategory");

    const bookCategories = await BookCategory.find();

    if (!zodValidation) {
        return res.status(400).render("book/", {
            apiResponse: new ApiResponse(400, {
                alert: true,
                title: "Input data is invalid",
                message: "Try again after some time",
                books,
                bookCategories
            })
        });
    }

    const category = bookCategories.find(bc => bc.categoryname === bookcategory);

    if (!category) {
        return res.status(400).render("book/", {
            apiResponse: new ApiResponse(400, {
                alert: true,
                title: "Input data is invalid",
                message: "Try again after some time"
            })
        });
    }

    if (id) {
        await Book.findByIdAndUpdate(id, { uniqueId, bookname, bookcategory: category._id });
    }
    else {
        await Book.create({ uniqueId, bookname, bookcategory: category._id });
    }

    const updatedBooks = await Book.find().populate("bookcategory");

    return res.status(200).render("book/", {
        apiResponse: new ApiResponse(200, {
            alert: true,
            title: id ? "Book updated succesfully." : "Book added succesfully.",
            message: "",
            bookCategories,
            books: updatedBooks
        })
    });
});

const deleteBook = asyncHandler(async (req, res) => {
    const id = req.body.id;
    console.log(id);
    await Book.findByIdAndDelete(id);

    const books = await Book.find().populate("bookcategory");
    const bookCategories = await BookCategory.find();

    return res.status(200).render("book/", {
        apiResponse: new ApiResponse(200, {
            alert: true,
            title: "Book deleted succesfully",
            message: "",
            books,
            bookCategories
        })
    });
});
export { renderBookPage, renderBookEdit, createOrUpdateBook, deleteBook };