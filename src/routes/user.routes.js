import { Router } from "express";
import {
  renderLogin,
  redirectToLogin,
  renderRegister,
  registerUser,
  loginUser,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/").get(redirectToLogin);

router.route("/login").get(renderLogin);

router.route("/register").get(renderRegister);

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

export default router;
