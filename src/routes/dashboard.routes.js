import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { renderDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/").get(verifyJwt, renderDashboard);

export default router;
