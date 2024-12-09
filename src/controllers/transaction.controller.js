import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Section } from "../models/section.model.js";
import { Student } from "../models/student.model.js";
import { Book } from "../models/book.model.js";
import { Transaction } from "../models/transaction.model.js";

//REBDER 
const renderBookIssuePage = asyncHandler(async (req, res) => {
    const sections = await Section.find();

    const sortedSectiions = sections.sort((a, b) => a.name.localeCompare(b.name));
    let apiResponse;
    if (req.session.apiResponse) {
        apiResponse = JSON.parse(JSON.stringify(req.session.apiResponse));
        req.session.apiResponse = null;
    } else {
        apiResponse = new ApiResponse(200, { alert: false, sections: sortedSectiions });
    }

    return res.status(apiResponse.statuscode).render("issue-book", { apiResponse });
});

//GET SECTION STUDNETS LIST
const getSectionStudents = asyncHandler(async (req, res) => {
    const sectionId = req.body.sectionId;
    if (!sectionId) {
        return res.status(400).json(new ApiResponse(400, { alert: true, title: "Can't find section id", message: "Try again" }));
    }

    const students = await Student.find({ section: sectionId });
    if (!students) {
        return res.status(400).json(new ApiResponse(400, { alert: true, title: "Can't find student list", message: "Try again" }));
    }

    res.status(200).json(new ApiResponse(200, { students }));
});

//CHECK BOOK IS ISSUED OR NOT
const checkBookIssued = asyncHandler(async (req, res) => {
    const bookUniqueId = req.body.uniqueId;

    if (!bookUniqueId) {
        return res.status(400).json(new ApiResponse(400, { alert: true, title: "uniqeid is not exist", message: "Try agian" }));
    }
    const book = await Book.findOne({ uniqueId: bookUniqueId });

    if (!book) {
        return res.status(400).json(new ApiResponse(400, { alert: true, title: "Can't find book.", message: "Book record dosen't exist" }));
    }

    const message = book.isIssued ? "Book is already issued" : "Book is available";
    return res.status(200).json(new ApiResponse(200, { alert: book.isIssued, message }));
});

//BOOK-ISSUE
const issueBooks = asyncHandler(async (req, res) => {
    console.log(req.body);
    const transaction = { studentId: req.body.studentId };
    const bookuniqIds = req.body.uniqueId;
    transaction.bookIds = typeof (bookuniqIds) === "string" ? [bookuniqIds] : bookuniqIds;

    ///TODO: Zod validation

    const books = await Book.find({
        uniqueId: {
            $in: transaction.bookIds
        }
    });

    if (books.length !== transaction.bookIds.length) {
        const validBookIds = books.map(book => book.uniqueId);
        const validateIds = transaction.bookIds.map(uniquIds => ({ uniquIds, isExist: validBookIds.includes(uniquIds) }));
        return res.status(400).json(new ApiResponse(400, { alert: "true", validateIds }));
    }

    //TODO: CREATE ENTRIES
    return res.send(books);
});

export { renderBookIssuePage, getSectionStudents, checkBookIssued, issueBooks };