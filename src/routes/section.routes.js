import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {
  renderSection,
  createOrUpdateSection,
  deleteSection,
} from "../controllers/section.controller.js";

const router = Router();

router.route("/section").get(verifyJwt, renderSection);

router.route("/section").get(verifyJwt, createOrUpdateSection);

router.route("/section").delete(verifyJwt, deleteSection);
