import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const renderDashboard = asyncHandler((req, res) => {
  const apiResponse = new ApiResponse(200, {});
  return res.status(200).render("dashboard", apiResponse);
});

export { renderDashboard };
