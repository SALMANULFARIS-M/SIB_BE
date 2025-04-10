import Course from "../models/course.js";

export const addCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
   next(err);
  }
};

export const getCourses = async (req, res) => {
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

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch (err) {
   next(err);
  }
};

export const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({success:true, message: "Course deleted" });
  } catch (err) {
   next(err);
  }
};
