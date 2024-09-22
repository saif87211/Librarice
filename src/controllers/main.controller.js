import { asyncHandler } from "../utils/asyncHandler.js";

const renderLogin = asyncHandler(async (req, res) => {
  res.render("login");
});

const renderRegister = asyncHandler(async (req, res) => {
  res.render("register");
});

export { renderLogin, renderRegister };
