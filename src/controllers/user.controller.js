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

const renderRegister = asyncHandler(async (req, res) => {
  return res.status(200).render("register", { apiResponse: new ApiResponse(200, { alert: false }) });
});

const redirectToLogin = asyncHandler(async (req, res) => {
  return res.status(200).redirect("/login");
});

const renderLogin = asyncHandler(async (req, res) => {
  return res.status(200).render("login", { apiResponse: new ApiResponse(200, { alert: false }) });
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

  if (!zodValidation) {
    return res.status(400).render("register", {
      apiResponse: new ApiResponse(400, {
        alert: true,
        title: "Invalid fields",
        message: "Provide proper fields",
      })
    });
  }

  let isUserExisted = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserExisted) {
    return res.status(409).render("register", {
      apiResponse: new ApiResponse(409, {
        alert: true,
        title: "User already exist",
        message: "user other email or username",
      })
    });
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
      apiResponse: new ApiResponse(500, {
        alert: true,
        title: "Internal server error",
        message: "Something went wrong while registering user!",
      })
    });
  }

  return res.status(200).render("register", {
    apiResponse: new ApiResponse(200, {
      alert: true,
      title: "User Successfully register",
      message: "Visit login page",
    })
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const zodValidation = validateLoginUser({ email, password });

  if (!zodValidation) {
    return res.status(400).render("login", {
      apiResponse: new ApiResponse(400, {
        alert: true,
        title: "Invlaid input",
        message: "Please enter valid data",
      })
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).render("login", {
      apiResponse: new ApiResponse(400, {
        alert: true,
        title: "Failed to login",
        message: "User does not exist",
      })
    });
  }

  const isPasswordIsValid = await user.isPasswordCorrect(password);

  if (!isPasswordIsValid) {
    return res.status(401).render("login", {
      apiResponse: new ApiResponse(401, {
        alert: true,
        title: "Failed to login",
        message: "Password is Invalid",
      })
    });
  }

  const token = await generateToken(user._id);

  if (!token) {
    return res.status(500).render("login", {
      apiResponse: new ApiResponse(500, {
        alert: true,
        title: "Interal server error",
        message: "Something Went Wrong",
      })
    });
  }

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .redirect("/dashboard");
});

export {
  renderLogin,
  redirectToLogin,
  renderRegister,
  registerUser,
  loginUser,
};
