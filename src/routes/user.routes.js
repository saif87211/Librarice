import { Router } from "express";
import {
  renderLogin,
  renderRegister,
  registerUser,
  loginUser,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/").get(renderLogin);

router.route("/register").get(renderRegister);

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

export default router;
