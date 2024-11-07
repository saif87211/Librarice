import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {
  renderBookCategoy,
  renderBookCategoryEdit,
  createOrUpdateCategoy,
  deleteBookCategory,
} from "../controllers/bookcategory.controller.js";

const router = Router();

router.route("/book-category").get(verifyJwt, renderBookCategoy);

router.route("/book-category-edit").post(verifyJwt, renderBookCategoryEdit);

router.route("/book-category").post(verifyJwt, createOrUpdateCategoy);

router.route("/book-category-delete").post(verifyJwt, deleteBookCategory);

export default router;