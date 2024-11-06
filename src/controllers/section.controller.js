import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Section } from "../models/section.model.js";

const renderSection = asyncHandler(async (req, res) => {
  const sections = await Section.find();

  if (!sections) {
    sections = [];
  }
  return res
    .status(200)
    .render("section/", {
      apiResponse: new ApiResponse(200, { alert: false, sections })
    });
});

const renderSectionEdit = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    const sections = await Section.find();
    return res
      .status(400)
      .render("section/", {
        apiResponse: new ApiResponse(400, {
          alert: true,
          title: "Something went wrong",
          message: "Try again after sometime",
          sections,
          delete: req.method === "DELETE"
        })
      });
  }
  const section = await Section.findById(id);

  if (!section) {
    const sections = await Section.find();
    return res.status(400).render("section", {
      apiResponse: new ApiResponse(400, {
        alert: true,
        title: "Invalid data",
        message: "Try again after sometime",
        sections
      })
    });
  }
  return res.status(200).render("section/section-edit", {
    apiResponse: new ApiResponse(200, { alert: false, section })
  })
});

const createOrUpdateSection = asyncHandler(async (req, res) => {
  const { sectionId, section } = req.body;
  if (!section) {
    const sections = await Section.find();
    return res.status(400).render("section", {
      apiResponse: new ApiResponse(400, {
        alert: true,
        title: "Invlaid input",
        message: "Please enter valid data",
        sections
      })
    });
  }

  if (sectionId) {
    await Section.findByIdAndUpdate(sectionId, { name: section });
  } else {
    await Section.create({ name: section });
  }
  const sections = await Section.find();
  return res
    .status(200)
    .render("section", {
      apiResponse: new ApiResponse(200, {
        alert: true,
        title: sectionId
          ? "Section updated successfully"
          : "Section added successfully",
        message: "",
        sections
      })
    });
});

const deleteSection = asyncHandler(async (req, res) => {
  const id = req.body.id;

  await Section.findByIdAndDelete(id);

  const sections = await Section.find();
  return res.status(200).render("section", {
    apiResponse: new ApiResponse(200, {
      alert: true,
      title: "Entry was deleted Succesfully",
      sections
    })
  });
});

export { renderSection, renderSectionEdit, createOrUpdateSection, deleteSection };
