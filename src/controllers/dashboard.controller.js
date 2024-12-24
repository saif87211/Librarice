import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../models/Transaction.model.js";
import { Section } from "../models/section.model.js";
import { BookCategory } from "../models/bookCategory.model.js";

const renderDashboard = asyncHandler(async (req, res) => {

  const dueData = await Transaction.aggregate([
    {
      '$lookup': {
        'from': 'students',
        'localField': 'stuId',
        'foreignField': '_id',
        'as': 'student',
        'pipeline': [
          {
            '$lookup': {
              'from': 'sections',
              'localField': 'section',
              'foreignField': '_id',
              'as': 'section'
            }
          }
        ]
      }
    }, {
      '$lookup': {
        'from': 'books',
        'localField': 'bookIds',
        'foreignField': '_id',
        'as': 'book',
        'pipeline': [
          {
            '$lookup': {
              'from': 'bookcategories',
              'localField': 'bookcategory',
              'foreignField': '_id',
              'as': 'bookcategory'
            }
          }
        ]
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
        'student': 1,
        'book': 1,
        'createdAt': 1,
        'section': {
          '$arrayElemAt': [
            {
              '$arrayElemAt': [
                '$student.section.name', 0
              ]
            }, 0
          ]
        },
        'studentname': {
          '$arrayElemAt': [
            '$student.name', 0
          ]
        },
        'issuedBy': {
          '$arrayElemAt': [
            '$issuedBy.username', 0
          ]
        }
      }
    }, {
      '$unwind': '$book'
    }, {
      '$addFields': {
        'today': {
          '$toDate': '$$NOW'
        },
        'returnDate': {
          '$dateAdd': {
            'startDate': '$createdAt',
            'unit': 'day',
            'amount': 1
          }
        }
      }
    }, {
      '$match': {
        '$expr': {
          '$gt': [
            '$today', '$returnDate'
          ]
        }
      }
    }, {
      '$addFields': {
        'totalFine': {
          '$multiply': [
            {
              '$dateDiff': {
                'startDate': '$returnDate',
                'endDate': '$today',
                'unit': 'day'
              }
            }, {
              '$arrayElemAt': [
                '$book.bookcategory.fine', 0
              ]
            }
          ]
        },
        'bookcategory': {
          '$arrayElemAt': [
            '$book.bookcategory.categoryname', 0
          ]
        },
        'dueDays': {
          '$dateDiff': {
            'startDate': '$returnDate',
            'endDate': '$today',
            'unit': 'day'
          }
        }
      }
    }, {
      '$project': {
        'section': 1,
        'studentname': 1,
        'bookcategory': 1,
        'issuedBy': 1,
        'uniqueId': '$book.uniqueId',
        'bookname': '$book.bookname',
        'issueDate': {
          '$dateToString': {
            'format': '%d-%m-%Y',
            'date': '$createdAt'
          }
        },
        'returnDate': {
          '$dateToString': {
            'format': '%d-%m-%Y',
            'date': '$returnDate'
          }
        },
        'totalFine': 1,
        'dueDays': 1
      }
    }
  ]);

  const categoryWiseBookCount = await BookCategory.aggregate([
    {
      '$lookup': {
        'from': 'books',
        'localField': '_id',
        'foreignField': 'bookcategory',
        'as': 'books'
      }
    }, {
      '$project': {
        'categoryname': 1,
        'booksCount': {
          '$size': '$books'
        }
      }
    }
  ]);

  const totalBooks = categoryWiseBookCount.map(category => category.booksCount).reduce((prev, next) => prev + next);

  const sectionWiseStuCount = await Section.aggregate([
    {
      '$lookup': {
        'from': 'students',
        'localField': '_id',
        'foreignField': 'section',
        'as': 'students'
      }
    }, {
      '$project': {
        'section': '$name',
        'studentsCount': {
          '$size': '$students'
        }
      }
    }
  ]);

  const totalStudents = sectionWiseStuCount.map(section => section.studentsCount).reduce((prev, next) => prev + next);

  return res.status(200).render("dashboard", { apiResponse: new ApiResponse(200, { alert: false, dueData, categoryWiseBookCount, sectionWiseStuCount, totalBooks, totalStudents }) });
});

export { renderDashboard };
