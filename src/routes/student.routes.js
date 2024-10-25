import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {
  renderStudentPage,
  createOrUpdateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";

const router = Router();

router.route("/student").get(verifyJwt, renderStudentPage);

router.route("/student").get(verifyJwt, createOrUpdateStudent);

router.route("/student").delete(verifyJwt, deleteStudent);
