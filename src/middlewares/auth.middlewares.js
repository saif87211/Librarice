import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { config } from "../config/config.js"

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      const apiResponse = new ApiResponse(401, {
        alert: true,
        title: "Unathorized Request",
        message: "Login again",
      });
      return res.status(401).render("login", { apiResponse });
    }

    const decodedToken = jwt.verify(token, config.tokenSecret);

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      const apiResponse = new ApiResponse(401, {
        alert: true,
        title: "Invalid access token",
        message: "Login again",
      });
      return res.status(401).render("login", { apiResponse });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error?.message);
    req.session.apiResponse = new ApiResponse(401, {
      alert: true,
      title: "Invalid access token",
      message: "Login again",
    });
    return res.redirect("/login");
  }
});
