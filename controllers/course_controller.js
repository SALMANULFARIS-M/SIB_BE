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


export const getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || '';
    const level = req.query.level || '';
    const type = req.query.type || ''; 

    const searchQuery = {
      ...(search
        ? {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { providerName: { $regex: search, $options: 'i' } },
            ],
          }
        : {}),
      ...(level ? { level } : {}),
      ...(type === 'online' ? { isOnline: true } : {}),
      ...(type === 'short-term' ? { isShortTerm: true } : {}),
    };

    // If no pagination is provided, return all matching courses
    if (!page || !limit) {
      const courses = await Course.find(searchQuery)
        .populate('collegeId')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        courses,
        total: courses.length,
      });
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(searchQuery)
        .populate('collegeId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(searchQuery),
    ]);

    return res.status(200).json({
      success: true,
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCoursesIds=  async (req, res, next) => {
  try {
    const courses = await Course.find({}, '_id').lean();
    const ids = courses.map(c => c._id.toString());
    res.json(ids);
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
