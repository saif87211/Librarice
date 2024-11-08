import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { renderBookPage, renderBookEdit, createOrUpdateBook, deleteBook } from "../controllers/book.controller.js"

const router = Router();

router.route("/book").get(verifyJwt, renderBookPage);

router.route("/book/book-edit").post(verifyJwt, renderBookEdit);

router.route("/book").post(verifyJwt, createOrUpdateBook);

router.route("/book-delete").post(verifyJwt, deleteBook);

export default router;