import { ObjectId } from 'mongodb';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../models/Transaction.model.js";
import { Section } from "../models/section.model.js";
import { Student } from "../models/student.model.js";
import { Book } from "../models/book.model.js";
import { validateIsseBook, validateReturnBook } from "../utils/validation.js"

//RENDER 
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

const renderReturnBookPage = asyncHandler(async (req, res) => {
    const sections = await Section.find();
    let apiResponse;
    if (req.session.apiResponse) {
        apiResponse = JSON.parse(JSON.stringify(req.session.apiResponse));
        req.session.apiResponse = null;
    } else {
        apiResponse = new ApiResponse(200, { alert: false, sections });
    }
    return res.status(apiResponse.statuscode).render("transaction/return-book", { apiResponse });
});

const renderFindBookPage = asyncHandler(async (req, res) => {
    let apiResponse;
    if (req.session.apiResponse) {
        apiResponse = JSON.parse(JSON.stringify(req.session.apiResponse));
        req.session.apiResponse = null;
    } else {
        apiResponse = new ApiResponse(200, { alert: false });
    }
    return res.status(apiResponse.statuscode).render("transaction/find-book", { apiResponse });
});

//GET SECTION STUDENTS LIST
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

//ISSUE-BOOKS
const issueBooks = asyncHandler(async (req, res) => {
    const stuId = req.body.studentId;
    const bookUniqueIds = typeof (req.body.uniqueId) === "string" ? [req.body.uniqueId] : req.body.uniqueId;

    //zod validation
    const zodValidation = validateIsseBook({ stuId, bookUniqueIds });
    if (!zodValidation) {
        return res.status(400).json(new ApiResponse(400, {
            alert: true,
            title: "Input data is invalid",
            message: "Try again after some time",
        }));
    }
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

    const transaction = await Transaction.create({ stuId, bookIds, issuedBy: req.user._id });

    if (!transaction) {
        return res.status(404).json(new ApiResponse(404, { title: "Internval server error", message: "Try again after sometime." }));
    }
    return res.status(200).json(new ApiResponse(200, { alert: true, title: "Books issued successfully." }));
});

//GET ISSUED BOOKS
const getIssuedBooks = asyncHandler(async (req, res) => {
    const stuId = req.body.stuId;
    if (!stuId) {
        return res.status(404).json(new ApiResponse(404, { alert: true, title: "Invalid id", message: "Try agian after sometime." }));
    }

    const student = await Student.findById(stuId);
    if (!student) {
        return res.status(404).json(new ApiResponse(404, { alert: true, title: "Can't find Student", message: "Try again after sometime." }));
    }

    const transaction = await Transaction.aggregate([
        {
            '$match': {
                'stuId': new ObjectId(student._id)
            }
        }, {
            '$lookup': {
                'from': 'books',
                'localField': 'bookIds',
                'foreignField': '_id',
                'as': 'bookIds'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'issuedBy',
                'foreignField': '_id',
                'as': 'issuedBy'
            }
        }, {
            '$project': {
                'bookIds': {
                    'uniqueId': 1,
                    'bookname': 1,
                    'issuedBy': {
                        'userId': {
                            '$arrayElemAt': [
                                '$issuedBy._id', 0
                            ]
                        },
                        'fullname': {
                            '$arrayElemAt': [
                                '$issuedBy.fullname', 0
                            ]
                        }
                    }
                }
            }
        }, {
            '$unwind': '$bookIds'
        }, {
            '$project': {
                'uniqueId': '$bookIds.uniqueId',
                'bookname': '$bookIds.bookname',
                'issuedBy': '$bookIds.issuedBy.fullname'
            }
        }
    ]);

    if (!transaction) {
        return res.status(404).json(new ApiResponse(500, { alert: true, title: "Something went wrong", message: "Try again after sometime." }));
    }

    return res.status(200).json(new ApiResponse(200, { alert: false, issuedBooks: transaction }));
});

//RETURN BOOK
const returnBook = asyncHandler(async (req, res) => {
    const removeBookId = req.body.uniqueId;

    if (!removeBookId || removeBookId.trim() === "") {
        return res.status(404).json(new ApiResponse(404, { alert: true, title: "Invalid id", message: "Try agian after sometime." }));
    }

    const book = await Book.findOneAndUpdate({ uniqueId: removeBookId }, { isIssued: false }, { new: true });

    if (!book) {
        return res.status(500).json(new ApiResponse(500, { alert: true, title: "Internal server error", message: "Try again after sometime" }));
    }
    const transaction = await Transaction.findOneAndUpdate(
        { bookIds: { $in: [book._id] } },
        { $pull: { bookIds: book._id } },
        { new: true }
    );

    if (!transaction || !transaction.bookIds.length) {
        await Transaction.findByIdAndDelete(transaction._id);
    }

    return res.status(200).json(new ApiResponse(200, { alert: "true", title: "Book returned successfully" }));
});

//GET BOOKINFO
const getBookInfo = asyncHandler(async (req, res) => {
    const bookUniqueId = req.body.uniqueId;

    if (!bookUniqueId || bookUniqueId.trim() === "") {
        return res.status(404).json(new ApiResponse(404, { alert: true, title: "Invalid id", message: "Try agian after sometime." }));
    }

    const book = await Book.find({ uniqueId: bookUniqueId }).select("-bookcategory");

    if (!book[0]) {
        return res.status(500).json(new ApiResponse(500, { alert: true, title: "Can't find book.", message: "Please check book uniqeId" }));
    }

    if (!book[0].isIssued) {
        return res.status(200).json(new ApiResponse(200, { alert: true, book, title: "Book is not issued." }));
    }

    const issuedBook = await Transaction.aggregate([
        {
            '$match': {
                'bookIds': {
                    '$in': [
                        new ObjectId(book[0]._id)
                    ]
                }
            }
        }, {
            '$unwind': '$bookIds'
        }, {
            '$match': {
                'bookIds': new ObjectId(book[0]._id)
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'issuedBy',
                'foreignField': '_id',
                'as': 'issuedBy'
            }
        }, {
            '$lookup': {
                'from': 'books',
                'localField': 'bookIds',
                'foreignField': '_id',
                'as': 'bookIds'
            }
        }, {
            '$lookup': {
                'from': 'students',
                'localField': 'stuId',
                'foreignField': '_id',
                'as': 'stuId'
            }
        }, {
            '$project': {
                'uniqueId': {
                    '$arrayElemAt': [
                        '$bookIds.uniqueId', 0
                    ]
                },
                'bookname': {
                    '$arrayElemAt': [
                        '$bookIds.bookname', 0
                    ]
                },
                'issuedBy': {
                    '$arrayElemAt': [
                        '$issuedBy.fullname', 0
                    ]
                },
                'studentname': {
                    '$arrayElemAt': [
                        '$stuId.name', 0
                    ]
                },
                'createdAt': 1
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200, { alert: false, issuedBook }));
});

export { renderBookIssuePage, getSectionStudents, checkBookIssued, issueBooks, renderReturnBookPage, getIssuedBooks, returnBook, getBookInfo, renderFindBookPage };