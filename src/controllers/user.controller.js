import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {
  validateRegisterUser,
  validateLoginUser,
} from "../utils/validation.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};
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
  return res.status(200).render("login");
});

const renderRegister = asyncHandler(async (req, res) => {
  return res.status(200).render("register");
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password, isAdmin } = req.body;
  const zodValidation = validateRegisterUser({
    fullname,
    username,
    email,
    password,
    isAdmin: false,
  });
  if (!zodValidation.success) {
    return res.status(400).json(
      new ApiResponse(400, {
        title: "Invalid fields",
        message: zodValidation.error.issues[0].message,
      })
    );
  }

  let isUserExisted = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserExisted) {
    return res.status(409).json(
      new ApiResponse(409, {
        title: "User already exist",
        message: "user other email or username",
      })
    );
  }

  const user = await User.create({
    fullname,
    username,
    email,
    password,
    isAdmin,
  });

  if (!user) {
    return res.status(500).json(
      new ApiResponse(500, {
        title: "Internal server error",
        message: "Something went wrong while registering user!",
      })
    );
  }

  return res.status(200).json(
    new ApiResponse(200, {
      title: "User Successfully register",
      message: "Visit login page",
    })
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const zodValidation = validateLoginUser({ email, password });
  if (!zodValidation.success) {
    return res.status(400).json(
      new ApiResponse(400, {
        title: "Invlaid input",
        message: zodValidation.error.issues[0].message,
      })
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json(
      new ApiResponse(400, {
        title: "Failed to login",
        message: "User does not exist",
      })
    );
  }

  const isPasswordIsValid = await user.isPasswordCorrect(password);

  if (!isPasswordIsValid) {
    return res.status(401).json(
      new ApiResponse(401, {
        title: "Failed to login",
        message: "Password is Invalid",
      })
    );
  }

  const token = await generateToken(user._id);

  if (!token) {
    return res.status(500).json(
      new ApiResponse(500, {
        title: "Interal server error",
        message: "Something Went Wrong",
      })
    );
  }

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .redirect("/dashboard");
});

export { renderLogin, renderRegister, registerUser, loginUser };
