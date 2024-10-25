import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {
  renderBookCategoy,
  createOrUpdateCategoy,
  deleteBookCategory,
} from "../controllers/bookcategory.controller.js";

const router = Router();

router.route("/section").get(verifyJwt, renderBookCategoy);

router.route("/section").get(verifyJwt, createOrUpdateCategoy);

router.route("/section").delete(verifyJwt, deleteBookCategory);
