import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {
  renderStudentPage,
  renderStudentEdit,
  createOrUpdateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";

const router = Router();

router.route("/student").get(verifyJwt, renderStudentPage);

router.route("/student/student-edit").post(verifyJwt, renderStudentEdit);

router.route("/student").post(verifyJwt, createOrUpdateStudent);

router.route("/student-delete").post(verifyJwt, deleteStudent);

export default router;