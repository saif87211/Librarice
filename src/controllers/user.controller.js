import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {
  validateRegisterUser,
  validateLoginUser,
} from "../utils/validation.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { config } from "../config/config.js"

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
      config.tokenSecret,
      { expiresIn: config.tokenExpiry }
    );
  } catch (error) {
    console.log(error);
    return false;
  }
};

//RENDER REGISTER
const renderRegister = asyncHandler(async (req, res) => {
  let apiResponse;
  if (req.session.apiResponse) {
    apiResponse = JSON.parse(JSON.stringify(req.session.apiResponse));
    req.session.apiResponse = null;
  } else {
    apiResponse = new ApiResponse(200, { alert: false });
  }
  return res.status(apiResponse.statuscode).render("register", { apiResponse });
});

//REDIRECT LOGIN
const redirectToLogin = asyncHandler(async (req, res) => {
  return res.status(200).redirect("/login");
});

//RENDER LOGIN
const renderLogin = asyncHandler(async (req, res) => {
  let apiResponse;
  if (req.session.apiResponse) {
    apiResponse = JSON.parse(JSON.stringify(req.session.apiResponse));
    req.session.apiResponse = null;
  } else {
    apiResponse = new ApiResponse(200, { alert: false });
  }
  return res.status(apiResponse.statuscode).render("login", { apiResponse });
});

//REGISTER
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
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: "Invalid fields",
      message: "Provide proper fields",
    });
    return res.redirect("/register");
  }

  let isUserExisted = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserExisted) {
    req.session.apiResponse = new ApiResponse(409, {
      alert: true,
      title: "User already exist",
      message: "Email or username is already exist"
    });

    return res.redirect("/register");
  }

  const user = await User.create({
    fullname,
    username,
    email,
    password,
    isAdmin,
  });

  if (!user) {
    req.session.apiResponse = new ApiResponse(500, {
      alert: true,
      title: "Internal server error",
      message: "Something went wrong while registering user!",
    });
    return res.redirect("/register");
  }

  req.session.apiResponse = new ApiResponse(200, {
    alert: true,
    title: "User Successfully register",
    message: "Visit login page",
  })
  return res.redirect("/register");
});

//LOGIN
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const zodValidation = validateLoginUser({ email, password });

  if (!zodValidation) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: "Invlaid input",
      message: "Please enter valid data",
    });

    return res.redirect("/login");
  }

  const user = await User.findOne({ email });

  if (!user) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: "Failed to login",
      message: "User does not exist",
    });

    return res.redirect("/login");
  }

  const isPasswordIsValid = await user.isPasswordCorrect(password);

  if (!isPasswordIsValid) {
    req.session.apiResponse = new ApiResponse(401, {
      alert: true,
      title: "Failed to login",
      message: "Password is Invalid",
    });

    return res.redirect("/login");
  }

  const token = await generateToken(user._id);

  if (!token) {
    req.session.apiResponse = new ApiResponse(500, {
      alert: true,
      title: "Interal server error",
      message: "Something Went Wrong",
    });

    return res.redirect("/login");
  }

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .redirect("/dashboard");
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordIsCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordIsCorrect) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: "Invalid old password.",
      message: "",
    });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res.redirect("/profile");
});

export {
  renderLogin,
  redirectToLogin,
  renderRegister,
  registerUser,
  loginUser,
  changeCurrentPassword
};
