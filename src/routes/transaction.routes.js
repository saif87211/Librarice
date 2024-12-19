import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js"
import { renderBookIssuePage, getSectionStudents, checkBookIssued, issueBooks, getIssuedBooks, returnBook, getBookInfo, renderReturnBookPage, renderFindBookPage } from "../controllers/transaction.controller.js";

const router = Router();

router.route("/issue-book").get(verifyJwt, renderBookIssuePage);

router.route("/return-book").get(verifyJwt, renderReturnBookPage);

router.route("/find-book").get(verifyJwt, renderFindBookPage);

router.route("/issue-book").post(verifyJwt, issueBooks);

router.route("/get-issue-books").post(verifyJwt, getIssuedBooks);

router.route("/section-students").post(verifyJwt, getSectionStudents);

router.route("/check-book-issued").post(verifyJwt, checkBookIssued);

router.route("/return-book").post(verifyJwt, returnBook);

router.route("/get-book-info").post(verifyJwt, getBookInfo);

export default router;