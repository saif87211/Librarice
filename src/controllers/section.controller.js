import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Section } from '../models/section.model.js';

//RENDER SECTION
const renderSection = asyncHandler(async (req, res) => {
  const sections = await Section.find();

  let apiResponse;
  if (req.session.apiResponse) {
    apiResponse = req.session.apiResponse;
    req.session.apiResponse = null;
    apiResponse.data.sections = sections;
  } else {
    apiResponse = new ApiResponse(200, { alert: false, sections });
  }
  return res.status(apiResponse.statuscode).render('section/', { apiResponse });
});

//RENDER SECTION-EDIT
const renderSectionEdit = asyncHandler(async (req, res) => {
  const id = req.body.id;

  if (!id) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: 'Something went wrong',
      message: 'Try again after sometime',
    });
    return res.redirect('/section');
  }
  const section = await Section.findById(id);

  if (!section) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: 'Invalid data',
      message: 'Try again after sometime',
    });
    return res.redirect('/section');
  }
  return res.status(200).render('section/section-edit', {
    apiResponse: new ApiResponse(200, { alert: false, section }),
  });
});

//CREATE OR EDIT SECTION
const createOrUpdateSection = asyncHandler(async (req, res) => {
  const { sectionId, section } = req.body;
  if (!section) {
    req.session.apiResponse = new ApiResponse(400, {
      alert: true,
      title: 'Invlaid input',
      message: 'Please enter valid data',
    });

    return res.redirect('/section');
  }

  if (sectionId) {
    await Section.findByIdAndUpdate(sectionId, { name: section });
  } else {
    await Section.create({ name: section });
  }
  req.session.apiResponse = new ApiResponse(200, {
    alert: true,
    title: sectionId
      ? 'Section updated successfully'
      : 'Section added successfully',
    message: '',
  });
  return res.redirect('/section');
});

//DELETE SECTION
const deleteSection = asyncHandler(async (req, res) => {
  const id = req.body.id;

  await Section.findByIdAndDelete(id);

  req.session.apiResponse = new ApiResponse(200, {
    alert: true,
    title: 'Section was deleted Succesfully',
  });
  return res.redirect('/section');
});

export {
  renderSection,
  renderSectionEdit,
  createOrUpdateSection,
  deleteSection,
};
