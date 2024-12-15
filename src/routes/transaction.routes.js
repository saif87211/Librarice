import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js"
import { renderBookIssuePage, getSectionStudents, checkBookIssued, issueBooks, getIssedBooks, returnBook, getBookInfo, renderReturnBookPage } from "../controllers/transaction.controller.js";

const router = Router();

router.route("/issue-book").get(verifyJwt, renderBookIssuePage);

router.route("/issue-book").post(verifyJwt, issueBooks);

router.route("/get-issue-books").post(getIssedBooks);

router.route("/section-students").post(verifyJwt, getSectionStudents);

router.route("/check-book-issued").post(verifyJwt, checkBookIssued);

router.route("/return-book").post(returnBook);

router.route("/get-book-info").post(getBookInfo);

export default router;