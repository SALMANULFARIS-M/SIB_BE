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
    const colleges = await College.find()
      .populate("universityId")
      .populate("availableCourses");
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

