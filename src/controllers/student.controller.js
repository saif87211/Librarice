import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";
import { validateStudent } from "../utils/validation.js";
import { Section } from "../models/section.model.js";

const renderStudentPage = asyncHandler(async (req, res) => {
  const students = await Student.find().select().populate({ path: "section" });
  const sections = await Section.find();
  if (!students) {
    students = [];
  }
  return res
    .status(200)
    .render(
      "student",
      {
        apiResponse: new ApiResponse(200, { alert: false, students, sections })
      });
});

const renderStudentEdit = asyncHandler(async (req, res) => {
  const id = req.body.id;

  const students = await Student.find().populate({ path: "section" });
  const sections = await Section.find();
  if (!id) {
    return res
      .status(400)
      .render("student/", {
        apiResponse: new ApiResponse(400, {
          alert: true,
          title: "Something went wrong",
          message: "Try again after sometime",
          sections,
          students
        })
      });
  }
  const student = students.find(s => String(s._id === id));
  if (!student) {
    return res
      .status(400)
      .render("student/", {
        apiResponse: new ApiResponse(400, {
          alert: true,
          title: "Something went wrong",
          message: "Entry was not found.",
          sections,
          students
        })
      });
  }

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

const createOrUpdateStudent = asyncHandler(async (req, res) => {
  const { id, name, rollno, medium, section, gender } = req.body;
  const zodValidation = validateStudent({
    name,
    rollno,
    medium,
    section,
    gender,
  });

  const students = await Student.find().populate({ path: "section" });
  const sections = await Section.find();

  if (!zodValidation) {
    return res.status(400).render("student", {
      apiResponse: new ApiResponse(400, {
        alert: true,
        title: "Invlaid input",
        message: "Please enter valid data",
        students,
        sections,
      })
    });
  }

  const newSection = await Section.findOne({ name: section });
  if (!newSection) {
    return res.status(400).render("student", {
      apiResponse: new ApiResponse(400, {
        alert: true,
        title: "Invlaid input",
        message: "Please enter valid data",
        students,
        sections
      })
    });
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
  const updatedStudents = await Student.find().populate({ path: "section" });
  return res
    .status(200)
    .render("student", {
      apiResponse: new ApiResponse(200, {
        alert: true,
        title: id
          ? "Studnet updated successfully"
          : "Student added successfully",
        message: "",
        students: updatedStudents,
        sections
      })
    });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const id = req.body.id;

  await Student.findById(id).deleteOne();

  const students = await Student.find().populate({ path: "section" });
  const sections = await Section.find();
  return res.status(200).
    render("student", {
      apiResponse: new ApiResponse(200, {
        alert: true,
        title: "Student was deleted Succesfully",
        students,
        sections
      })
    });
});

export { renderStudentPage, renderStudentEdit, createOrUpdateStudent, deleteStudent };
