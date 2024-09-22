import { Router } from "express";
import { renderLogin, renderRegister } from "../controllers/main.controller.js";

const router = Router();

router.route("/").get(renderLogin);
router.route("/register").get(renderRegister);

export default router;
