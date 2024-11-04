import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Section } from "../models/section.model.js";

const renderSection = asyncHandler(async (req, res) => {
  const sections = await Section.find();

  if (!sections) {
    sections = [];
  }
  return res.status(200).render("section", { apiResponse: new ApiResponse(200, { alert: false, sections }) });
});

const createOrUpdateSection = asyncHandler(async (req, res) => {
  const { sectionId, section } = req.body;
  if (!section) {
    return res.status(400).render("section", {
      apiResponse: new ApiResponse(400, {
        alert: true,
        title: "Invlaid input",
        message: "Please enter valid data",
      })
    });
  }

  if (sectionId) {
    await Section.findByIdAndUpdate(sectionId, { name: section });
  } else {
    await Section.Create({ name: section });
  }

  return res.status(200).render("section", {
    apiResponse: new ApiResponse(200, {
      alert: true,
      title: sectionId
        ? "Section updated successfully"
        : "Section added successfully",
      message: "",
    })
  });
});

const deleteSection = asyncHandler(async (req, res) => {
  const _id = req.body._id;

  await Section.findByIdAndDelete(_id);

  return res.status(200).render("section", {
    apiResponse: new ApiResponse(200, {
      alert: true,
      title: "Entry was deleted Succesfully",
    })
  });
});

export { renderSection, createOrUpdateSection, deleteSection };
