import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";
import { validateStudent } from "../utils/validation.js";
import { Section } from "../models/section.model.js";

const renderStudentPage = asyncHandler(async (req, res) => {
  const students = await Student.find();
  if (!students) {
    students = [];
  }
  return res.status(200).render("student", { apiResponse: new ApiResponse(200, { students }) });
});

const createOrUpdateStudent = asyncHandler(async (req, res) => {
  const { stuId, name, rollno, medium, section, gender } = req.body;

  const zodValidation = validateStudent({
    name,
    rollno,
    medium,
    section,
    gender,
  });

  if (!zodValidation) {
    return res.status(400).render("student", {
      apiResponse: new ApiResponse(400, {
        alert: true,
        title: "Invlaid input",
        message: "Please enter valid data",
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
      })
    });
  }
  if (stuId) {
    await Student.findByIdAndUpdate(stuId, {
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

  return res.status(200).render("student", {
    apiResponse: new ApiResponse(200, {
      alert: true,
      title: stuId
        ? "Studnet updated successfully"
        : "Student added successfully",
      message: "",
    })
  });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const _id = req.body._id;

  await Student.findById(_id).deleteOne();

  return res.status(200).render("student", {
    apiResponse: new ApiResponse(200, {
      alert: true,
      title: "Entry was deleted Succesfully",
    })
  });
});

export { renderStudentPage, createOrUpdateStudent, deleteStudent };
