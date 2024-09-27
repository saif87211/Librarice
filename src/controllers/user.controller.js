import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {
  validateRegisterUser,
  validateLoginUser,
} from "../utils/validation.js";

const generateToken = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        fullname: user.fullname,
        isAdmin: user.isAdmin,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );
  } catch (error) {
    console.log(error);
    return false;
  }
};

const renderLogin = asyncHandler(async (req, res) => {
  res.status(200).render("login", { message: "" });
});

const renderRegister = asyncHandler(async (req, res) => {
  res.status(200).render("register", { message: "" });
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password, isAdmin } = req.body;

  if (!validateRegisterUser({ fullname, username, email, password, isAdmin })) {
    return res.status(400).render("register", { message: "Invalid fields" });
  }

  let isUserExisted = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserExisted) {
    return res
      .status(409)
      .render("register", { message: "User already exist." });
  }

  const user = await User.create({
    fullname,
    username,
    email,
    password,
    isAdmin,
  });

  if (!user) {
    return res.status(500).render("register", {
      message: "Something went wrong while registering user!",
    });
  }

  return res
    .status(200)
    .render("register", { message: "You have registerd Successfully" });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!validateLoginUser({ email, password })) {
    return res.status(400).render("login", { message: "Invalid fields" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).render("login", { message: "User does not exist" });
  }

  const isPasswordIsValid = await user.isPasswordCorrect(password);

  if (!isPasswordIsValid) {
    return res.status(401).render("login", { message: "Password is Invalid" });
  }

  const token = await generateToken(user._id);
  console.log(token);
  if (!token) {
    return res.status(500).render("login", { message: "Something Went Wrong" });
  }

  return res.status(200).json({ token, message: "Login" });
});

export { renderLogin, renderRegister, registerUser, loginUser };
