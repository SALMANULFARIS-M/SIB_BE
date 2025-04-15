import College from "../models/college.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const addCollege = async (req, res, next) => {
  try {    
    const {
      name,
      universityId,
      rating,
      location,
      isAutonomous,
      description,
      feeFrom,
      feeUpto,
      courseLevels,
      category, 
    } = req.body;


    const files = req.files;
    const imageUrls = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const streamUpload = () =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "colleges" },
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });

        const result = await streamUpload();
        imageUrls.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    const newCollege = new College({
      name,
      rating: Number(rating) || 0,
      location,
      isAutonomous: isAutonomous === 'true' || isAutonomous === true,
      description,
      feeFrom: Number(feeFrom),
      feeUpto: Number(feeUpto),
      courseLevels: Array.isArray(courseLevels)
        ? courseLevels
        : [courseLevels],
        category: Array.isArray(category)
        ? category
        : [category],
      photos: imageUrls,
      ...(universityId && universityId !== 'autonomous' && {
        universityId,
      }),
    });

    await newCollege.save();

    res.status(201).json(newCollege);
  } catch (err) {
    next(err);
  }
};

export const getColleges = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    const category = req.query.category || "";

    const searchQuery = {
      ...(search ? { name: { $regex: search, $options: "i" } } : {}),
    
      // Regular category
      ...(category && category !== 'All' && category !== 'Top Rated' && category !== 'Autonomous'
        ? { category: { $in: [category] } }
        : {}),
    
      // Top Rated category
      ...(category === 'Top Rated'
        ? { rating: { $gte: 3.8, $lte: 4.5 } }
        : {}),
    
      // Autonomous colleges
      ...(category === 'Autonomous'
        ? { isAutonomous: true }
        : {}),
    };
    

    if (!page || !limit) {
      const colleges = await College.find(searchQuery)
        .populate("universityId")
        .populate("availableCourses")
        .lean();

      return res.status(200).json({
        success: true,
        colleges,
        total: colleges.length,
      });
    }

    const skip = (page - 1) * limit;

    const colleges = await College.find(searchQuery)
      .populate("universityId")
      .populate("availableCourses")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await College.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      colleges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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

export const updateCollege = async (req, res, next) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(college);
  } catch (err) {
    next(err);
  }
};



export const deleteCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // If college has photos, delete each from Cloudinary
    if (college.photos && college.photos.length > 0) {
      for (const photo of college.photos) {
        if (photo.public_id) {
          await cloudinary.uploader.destroy(photo.public_id);
        }
      }
    }

    // Now delete the college from DB
    await College.findByIdAndDelete(req.params.id);

    res.json({ message: 'College deleted successfully' });
  } catch (err) {
    next(err);
  }
};

