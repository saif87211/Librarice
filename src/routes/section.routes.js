import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {
  renderSection,
  renderSectionEdit,
  createOrUpdateSection,
  deleteSection,
} from "../controllers/section.controller.js";

const router = Router();

router.route("/section").get(verifyJwt, renderSection);

router.route("/section/section-edit").post(verifyJwt, renderSectionEdit);

router.route("/section").post(verifyJwt, createOrUpdateSection);

router.route("/section/delete").post(verifyJwt, deleteSection);

router.route("/section/delete").get(verifyJwt, renderSection);


export default router;