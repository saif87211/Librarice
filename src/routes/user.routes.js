import { Router } from "express";
import {
  renderLogin,
  redirectToLogin,
  renderRegister,
  registerUser,
  loginUser,
  changeCurrentPassword,
  renderProfile,
  updateProfile,
  logout
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js"

const router = Router();

router.route("/").get(redirectToLogin);

router.route("/login").get(renderLogin);

router.route("/register").get(renderRegister);

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logout);

//secure routes
router.route("/user/profile").get(verifyJwt, renderProfile);

router.route("/user/update-profile").post(verifyJwt, updateProfile);

router.route("/user/change-password").post(verifyJwt, changeCurrentPassword);

export default router;
