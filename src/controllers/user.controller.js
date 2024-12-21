import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Transaction } from "../models/Transaction.model.js";
import {
  validateRegisterUser,
  validateLoginUser,
} from "../utils/validation.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { config } from "../config/config.js"
import { ObjectId } from "mongodb";

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

const renderProfile = asyncHandler(async (req, res) => {

  const recentIssuedBooks = await Transaction.aggregate([
    {
      '$match': {
        'issuedBy': new ObjectId(req.user._id)
      }
    }, {
      '$sort': {
        'createdAt': 1
      }
    }, {
      '$limit': 10
    }, {
      '$lookup': {
        'from': 'students',
        'localField': 'stuId',
        'foreignField': '_id',
        'as': 'student'
      }
    }, {
      '$lookup': {
        'from': 'books',
        'localField': 'bookIds',
        'foreignField': '_id',
        'as': 'books',
        'pipeline': [
          {
            '$lookup': {
              'from': 'bookcategories',
              'localField': 'bookcategory',
              'foreignField': '_id',
              'as': 'bookcategory'
            }
          }
        ]
      }
    }, {
      '$unwind': '$books'
    }, {
      '$project': {
        'student': {
          '$arrayElemAt': [
            '$student.name', 0
          ]
        },
        'bookUniqeId': '$books.uniqueId',
        'book': '$books.bookname',
        'bookcategory': {
          '$arrayElemAt': [
            '$books.bookcategory.categoryname', 0
          ]
        },
        'createdAt': {
          '$dateToString': {
            'format': '%d-%m-%Y',
            'date': '$createdAt'
          }
        }
      }
    }
  ]);

  let apiResponse;
  if (req.session.apiResponse) {
    apiResponse = JSON.parse(JSON.stringify(req.session.apiResponse));
    req.session.apiResponse = null;
  } else {
    apiResponse = new ApiResponse(200, { alert: false });
  }
  const { username, fullname, email, _id } = req.user;

  apiResponse.data.user = { username, fullname, email, _id };
  apiResponse.data.recentIssedBooks = recentIssuedBooks;


  return res.status(apiResponse.statuscode).render("user/profile", { apiResponse });
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

const updateProfile = asyncHandler(async (req, res) => {
  const { fullname, username, email, _id } = req.body;

  //ZOD VALIDATION

  const user = await User.findByIdAndUpdate(_id, { fullname, username, email }, { new: true }).select("-password");
  if (!user) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: "Can't find the user",
      message: "Try again after some time",
    });
    res.redirect("/user/profile");
  }

  req.session.apiResponse = new ApiResponse(200, {
    alert: true,
    title: "User profile updated succesfully",
    message: "",
  });
  res.redirect("/user/profile");
});

const logout = asyncHandler(async (req, res) => {
  return res.status(200).clearCookie("token", cookieOptions).redirect("/");
});

export {
  renderLogin,
  redirectToLogin,
  renderRegister,
  registerUser,
  loginUser,
  changeCurrentPassword,
  renderProfile,
  updateProfile,
  logout
};
