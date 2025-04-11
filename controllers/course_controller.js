import Course from "../models/course.js";

export const addCourse = async (req, res, next) => {
  try {
    const {
      title,
      degree,
      level,
      category,
      fees,
      durationValue,
      durationUnit,
      medianLPA,
      affiliation,
      collegeId,
      providerType,
      providerName,
      isOnline,
      isOffline,
      isShortTerm,
    } = req.body;


    // Basic validation (optional but user-friendly)
    if (!title || !degree || !level || !category || !fees || !durationValue || !durationUnit || !medianLPA) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newCourse = new Course({
      title: title.trim(),
      degree: degree.trim(),
      level,
      category,
      fees,
      durationValue,
      durationUnit,
      medianLPA,
      affiliation: affiliation?.trim(),
      collegeId: collegeId || null,
      providerType,
      providerName: providerName?.trim() || null,
      isOnline: !!isOnline,
      isOffline: !!isOffline,
      isShortTerm: !!isShortTerm,
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course added successfully",
      data: newCourse,
    });
  } catch (err) {
    next(err);
  }
};



export const getCourses = async (req, res,next) => {
  try {
    const courses = await Course.find().populate("collegeId");    
    res.json(courses);
  } catch (err) {
   next(err);
  }
};

export const getCoursesById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const college = await Course.findById(id);
      if (!college) {
        return res.status(404).json({ message: "College not found" });
      }
  
      res.json(college);
    } catch (err) {
      next(err);
    }
  };

export const updateCourse = async (req, res,next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch (err) {
   next(err);
  }
};

export const deleteCourse = async (req, res,next) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({success:true, message: "Course deleted" });
  } catch (err) {
   next(err);
  }
};
