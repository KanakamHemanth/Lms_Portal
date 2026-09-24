const mongoose = require("mongoose");
const Course = require("../models/course");

async function getCourses(req, res) {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email role")
      .sort({ createdAt: -1 });
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to access courses",
      error: error.message,
    });
  }
}

async function getCourseById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Course not found" });
    }

    const course = await Course.findById(id).populate("instructor", "name email role");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to access course",
      error: error.message,
    });
  }
}

async function createCourses(req, res) {
  try {
    const { title, description, category, level, price, duration } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !level ||
      price === undefined ||
      price === null ||
      duration === undefined ||
      duration === null
    ) {
      return res.status(400).json({
        message: "Bad Request. All fields (title, description, category, level, price, duration) are required.",
      });
    }

    const numPrice = Number(price);
    const numDuration = Number(duration);

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number.",
      });
    }

    if (isNaN(numDuration) || numDuration <= 0) {
      return res.status(400).json({
        message: "Duration must be a valid positive number.",
      });
    }

    const existingCourse = await Course.findOne({ title: title.trim() });
    if (existingCourse) {
      return res.status(400).json({
        message: "Bad request, course already exists with this title",
      });
    }

    const course = new Course({
      title: title.trim(),
      description: description.trim(),
      instructor: req.user._id,
      category: category.trim(),
      level: level.trim(),
      price: numPrice,
      duration: numDuration,
    });

    await course.save();
    await course.populate("instructor", "name email role");

    return res.status(201).json({
      message: "New Course Created",
      course: course,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to create course",
      error: error.message,
    });
  }
}

async function updateCourses(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check authorization: admin can update any course, instructor can only update their own
    if (
      req.user.role !== "admin" &&
      existingCourse.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You can only update your own courses",
      });
    }

    const updateData = { ...req.body };
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }
    if (updateData.duration !== undefined) {
      updateData.duration = Number(updateData.duration);
    }
    // Prevent updating instructor field unless admin
    if (req.user.role !== "admin") {
      delete updateData.instructor;
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    }).populate("instructor", "name email role");

    return res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to update course",
      error: error.message,
    });
  }
}

async function deleteCourses(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check authorization: admin can delete any course, instructor can only delete their own
    if (
      req.user.role !== "admin" &&
      existingCourse.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You can only delete your own courses",
      });
    }

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to delete course",
      error: error.message,
    });
  }
}

module.exports = {
  getCourses,
  createCourses,
  deleteCourses,
  updateCourses,
  getCourseById,
};
