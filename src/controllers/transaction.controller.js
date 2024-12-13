import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Section } from "../models/section.model.js";
import { Student } from "../models/student.model.js";
import { Book } from "../models/book.model.js";
import { Transaction } from "../models/transaction.model.js";

//REBDER 
const renderBookIssuePage = asyncHandler(async (req, res) => {
    const sections = await Section.find();

    let apiResponse;
    if (req.session.apiResponse) {
        apiResponse = JSON.parse(JSON.stringify(req.session.apiResponse));
        req.session.apiResponse = null;
    } else {
        apiResponse = new ApiResponse(200, { alert: false, sections });
    }

    return res.status(apiResponse.statuscode).render("transaction/issue-book", { apiResponse });
});

//GET SECTION STUDNETS LIST
const getSectionStudents = asyncHandler(async (req, res) => {
    const sectionId = req.body.sectionId;
    if (!sectionId) {
        return res.status(400).json(new ApiResponse(400, { alert: true, title: "Can't find section id", message: "Try again" }));
    }

    const students = await Student.find({ section: sectionId }).select({ name: 1 });
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
        return res.status(400).json(new ApiResponse(400, { alert: true, title: "uniqeid is not exist", message: "Book record dosen't exist" }));
    }

    const title = book.isIssued ? "Book is already issued" : "Book is available";
    return res.status(200).json(new ApiResponse(200, { alert: book.isIssued, title }));
});

//BOOK-ISSUE
const issueBooks = asyncHandler(async (req, res) => {
    const stuId = req.body.studentId;
    const bookUniqueIds = typeof (req.body.uniqueId) === "string" ? [req.body.uniqueId] : req.body.uniqueId;

    //zod validation

    const student = await Student.findById(stuId);

    if (!student) {
        return res.status(400).json(new ApiResponse(400, { alert: "true", title: "Invalid student", message: "Try again after some time" }));
    }

    const books = await Book.find({
        uniqueId: {
            $in: bookUniqueIds
        }
    }).select({ uniqueId: 1, isIssued: 1 });
    
    const invalidIds = [];
    for (const bookId of bookUniqueIds) {
        const book = books.find(b => b.uniqueId === bookId);
        if (!book) {
            invalidIds.push({
                uniqueId: bookId,
                message: "This id is not exist"
            });
            continue;
        }
        if (book.isIssued) {
            invalidIds.push({
                uniqueId: bookId,
                message: "Book is already issued"
            });
        }
    }
    if (invalidIds.length) {
        return res.status(400).json(new ApiResponse(400, { alert: true, title: "Validation failed", invalidIds }));
    }
    books.forEach(async (book) => {
        book.isIssued = true;
        await book.save();
    });
    const bookIds = books.map(b => b._id);

    const transaction = await Transaction.create({ stuId, bookIds });

    if (!transaction) {
        return res.status(404).json(new ApiResponse(404, { title: "Internval server error", message: "Try again after sometime." }));
    }
    return res.status(200).json(new ApiResponse(200, { alert: true, title: "Books issued successfully." }));
});
export { renderBookIssuePage, getSectionStudents, checkBookIssued, issueBooks };