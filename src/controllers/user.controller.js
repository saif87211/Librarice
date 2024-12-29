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
  //secure: true, //uncomment this if you are using secure server 
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

//RENDER PROFILE PAGE
const renderProfile = asyncHandler(async (req, res) => {

  const recentIssuedBooks = await Transaction.aggregate([
    {
      '$match': {
        'issuedBy': new ObjectId(req.user._id)
      }
    }, {
      '$sort': {
        'createdAt': -1
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
  const { username, fullname, email, _id, isAdmin } = req.user;

  if (isAdmin) {
    apiResponse.data.pendingUsers = await User.aggregate([
      {
        '$match': {
          'isApproved': false
        }
      }, {
        '$project': {
          'fullname': 1,
          'username': 1,
          'email': 1,
          'createdAt': {
            '$dateToString': {
              'format': '%d-%m-%Y',
              'date': '$createdAt'
            }
          }
        }
      }
    ]);
  }

  apiResponse.data.user = { username, fullname, email, _id };
  apiResponse.data.recentIssedBooks = recentIssuedBooks;
  apiResponse.isAdmin = isAdmin;
  return res.status(apiResponse.statuscode).render("user/profile", { apiResponse });
});

//RENDER USER MANAGE PAGE
const renderMangeUsers = asyncHandler(async (req, res) => {

  if (!req.user.isAdmin) {
    req.session.apiResponse = new ApiResponse(403, {
      alert: true,
      title: "Not allowed",
      message: "You don't have permission to access this page."
    });
    return res.redirect("/dashboard");
  }

  let apiResponse;
  if (req.session.apiResponse) {
    apiResponse = JSON.parse(JSON.stringify(req.session.apiResponse));
    req.session.apiResponse = null;
  } else {
    apiResponse = new ApiResponse(200, { alert: false }, req.user.isAdmin);
  }

  const users = await User.aggregate([
    {
      '$match': {
        '$and': [
          {
            '_id': {
              '$ne': new ObjectId(req.user._id)
            }
          }, {
            'isApproved': true
          }
        ]
      }
    }, {
      '$project': {
        'fullname': 1,
        'username': 1,
        'email': 1,
        'isAdmin': 1,
        'isApproved': 1,
        'registerdAt': {
          '$dateToString': {
            'format': '%d-%m-%Y',
            'date': '$createdAt'
          }
        }
      }
    }
  ]);

  apiResponse.data.users = users;
  return res.status(apiResponse.statuscode).render("./user/manage-users", { apiResponse });
});

//REGISTER
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  let isAdmin = false;
  let isApproved = false;

  const zodValidation = validateRegisterUser({
    fullname,
    username,
    email,
    password,
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

  const users = await User.find();

  if (!users.length) {
    isAdmin = true; //first time register makes you admin
    isApproved = true;
  }
  const user = await User.create({
    fullname,
    username,
    email,
    password,
    isAdmin,
    isApproved
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

  if (!user.isApproved) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: "Your registration request is not approved.",
      message: "Contact your administrator.",
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

//CHANGE-PASSWORD
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

//UPDATE-USER DATA
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

//LOGOUT
const logout = asyncHandler(async (req, res) => {
  return res.status(200).clearCookie("token", cookieOptions).redirect("/");
});

//CHANGE USER ROLE TO ADMIN
const changeRoleToAdmin = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    req.session.apiResponse = new ApiResponse(403, {
      alert: true,
      title: "Not allowed this action",
      message: "You don't have permission perform this action"
    });
    return res.redirect("/dashboard");
  }

  const id = req.body.id;

  const user = await User.findByIdAndUpdate(id, { isAdmin: true }, { new: true });

  if (!user.isAdmin) {
    req.session.apiResponse = new ApiResponse(500, {
      alert: "true",
      title: "Internal server error",
      message: "Try again after some time."
    });
    return res.redirect("/user/manage-users");
  }

  req.session.apiResponse = new ApiResponse(200, { alert: "true", title: "User updated to admin.", message: "" });
  return res.redirect("/user/manage-users");
});

//CHANGE ADMIN ROLE TO USER
const changeRoleToUser = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    req.session.apiResponse = new ApiResponse(403, {
      alert: true,
      title: "Not allowed this action",
      message: "You don't have permission perform this action"
    });
    return res.redirect("/dashboard");
  }

  const id = req.body.id;
  const user = await User.findByIdAndUpdate(id, { isAdmin: false }, { new: true });

  if (user.isAdmin) {
    req.session.apiResponse = new ApiResponse(500, {
      alert: "true",
      title: "Internal server error",
      message: "Try again after some time."
    });
    return res.redirect("/user/manage-users");
  }

  req.session.apiResponse = new ApiResponse(200, { alert: "true", title: "User downgraded from admin role", message: "" });
  return res.redirect("/user/manage-users");
});

//APPROVED NEW REGISTRAION REQ
const approveNewUser = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    req.session.apiResponse = new ApiResponse(403, {
      alert: true,
      title: "Not allowed this action",
      message: "You don't have permission perform this action"
    });
    return res.redirect("/dashboard");
  }

  const id = req.body.id;
  const user = await User.findByIdAndUpdate(id, { isApproved: true }, { new: true });

  if (!user.isApproved) {
    req.session.apiResponse = new ApiResponse(500, {
      alert: "true",
      title: "Internal server error",
      message: "Try again after some time."
    });
    return res.redirect("/user/profile");
  }

  req.session.apiResponse = new ApiResponse(200, { alert: "true", title: "New user request approved.", message: "" });
  return res.redirect("/user/profile");
});

//DELETE USER
const deleteUser = asyncHandler(async (req, res) => {

  if (!req.user.isAdmin) {
    req.session.apiResponse = new ApiResponse(403, {
      alert: true,
      title: "Not allowed this action",
      message: "You don't have permission perform this action"
    });
    return res.redirect("/dashboard");
  }
  const id = req.body.id;

  const deleteUser = await User.findByIdAndDelete(id);

  if (!deleteUser) {
    req.session.apiResponse = new ApiResponse(500, { alert: "true", title: "Internal server error", message: "Try again after some time." });
    return res.redirect("/dashboard");
  }

  req.session.apiResponse = new ApiResponse(200, { alert: "true", title: "User deleted succefully", message: "" });
  return res.redirect("/dashboard");
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
  logout,
  renderMangeUsers,
  deleteUser,
  changeRoleToAdmin,
  changeRoleToUser,
  approveNewUser
};
