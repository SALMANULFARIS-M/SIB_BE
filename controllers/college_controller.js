import College from "../models/college.js";

export const addCollege = async (req, res) => {
  try {
    const college = new College(req.body);
    await college.save();
    res.status(201).json(college);
  } catch (err) {
   next(err);
  }
};

export const getColleges = async (req, res) => {
  try {
    const colleges = await College.find().populate("universityId").populate("availableCourses");
    res.json(colleges);
  } catch (err) {
   next(err);
  }
};

export const getCollegeById = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const college = await College.findById(id)
        .populate("universityId")
        .populate("availableCourses");
  
      if (!college) {
        return res.status(404).json({ message: "College not found" });
      }
  
      res.json(college);
    } catch (err) {
      next(err);
    }
  };
  
export const updateCollege = async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(college);
  } catch (err) {
   next(err);
  }
};

export const deleteCollege = async (req, res) => {
  try {
    await College.findByIdAndDelete(req.params.id);
    res.json({ message: "College deleted" });
  } catch (err) {
   next(err);
  }
};
