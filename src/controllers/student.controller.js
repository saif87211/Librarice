import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";
import { validateStudent } from "../utils/validation.js";
import { Section } from "../models/section.model.js";
import { Transaction } from "../models/Transaction.model.js";

//RENDER STUDENT
const renderStudentPage = asyncHandler(async (req, res) => {
  const students = await Student.find().select().populate({ path: "section" });
  const sections = await Section.find();

  let apiResponse;
  if (req.session.apiResponse) {
    apiResponse = req.session.apiResponse;
    req.session.apiResponse = null;
  } else {
    apiResponse = new ApiResponse(200, { alert: false });
  }

  apiResponse.data = { ...apiResponse.data, students, sections };

  apiResponse.isAdmin = req.user.isAdmin;
  return res.status(apiResponse.statuscode).render("student", { apiResponse });
});

//RENDER STUDENT-EDIT
const renderStudentEdit = asyncHandler(async (req, res) => {
  const id = req.body.id;

  if (!id) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: "Something went wrong",
      message: "Try again after sometime",
    });
    return res.redirect("/student");
  }
  const student = await Student.findById(id).populate({ path: "section" });
  if (!student) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: "Something went wrong",
      message: "Entry was not found.",
    });
    return res.redirect("/student");
  }

  const sections = await Section.find();
  return res
    .status(200)
    .render("student/student-edit", {
      apiResponse: new ApiResponse(200, {
        alert: false,
        student,
        sections
      })
    });
});

//CREATE OR EDIT STUDENT
const createOrUpdateStudent = asyncHandler(async (req, res) => {
  const { id, name, rollno, medium, section, gender } = req.body;
  const zodValidation = validateStudent({
    name,
    rollno,
    medium,
    section,
    gender,
  });

  if (!zodValidation) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: "Invlaid input",
      message: "Please enter valid data",
    });
    return res.redirect("/student");
  }

  const newSection = await Section.findOne({ name: section });
  if (!newSection) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: "Invlaid input",
      message: "Please enter valid data",
    });
    return res.redirect("/student");
  }
  if (id) {
    await Student.findByIdAndUpdate(id, {
      name,
      rollno,
      section: newSection._id,
      medium,
      gender,
    });
  } else {
    await Student.create({
      name,
      rollno,
      medium,
      section: newSection._id,
      gender,
    });
  }
  req.session.apiResponse = new ApiResponse(200, {
    alert: true,
    title: id
      ? "Studnet updated successfully"
      : "Student added successfully",
    message: "",
  });
  return res.redirect("/student");
});

//DELETE STUDENT
const deleteStudent = asyncHandler(async (req, res) => {
  const id = req.body.id;

  const transaction = await Transaction.find({ stuId: id });

  if (transaction.length) {
    req.session.apiResponse = new ApiResponse(409, {
      alert: true,
      title: "Can't delete this student entry.",
      message: "This student has issued some books"
    });
    return res.redirect("/student");
  }
  await Student.findById(id).deleteOne();

  req.session.apiResponse = new ApiResponse(200, {
    alert: true,
    title: "Student was deleted Succesfully",
    message: ""
  });
  return res.redirect("/student");
});

export { renderStudentPage, renderStudentEdit, createOrUpdateStudent, deleteStudent };
