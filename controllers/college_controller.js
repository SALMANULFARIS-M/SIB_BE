import College from "../models/college.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (fileBuffer, folder = "colleges") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (result) resolve(result);
        else reject(err);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

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
      category, // Frontend sends as 'category' for add
    } = req.body;

    const files = req.files;
    const imageUrls = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer);
        imageUrls.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    // Fix: Handle arrays properly
    const processedCourseLevels = Array.isArray(courseLevels) 
      ? courseLevels 
      : courseLevels 
        ? [courseLevels] 
        : [];

    const processedCategories = Array.isArray(category) 
      ? category 
      : category 
        ? [category] 
        : [];

    const newCollege = new College({
      name,
      rating: Number(rating) || 0,
      location,
      isAutonomous: isAutonomous === "true" || isAutonomous === true,
      description,
      feeFrom: Number(feeFrom),
      feeUpto: Number(feeUpto),
      courseLevels: processedCourseLevels,
      category: processedCategories, // Use 'category' field in schema
      photos: imageUrls,
      ...(universityId &&
        universityId !== "autonomous" && {
          universityId,
        }),
    });

    await newCollege.save().catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    });

    res.status(201).json({ success: true, college: newCollege });
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
      ...(category &&
      category !== "All" &&
      category !== "Top Rated" &&
      category !== "Autonomous"
        ? { category: { $in: [category] } }
        : {}),

      // Top Rated category
      ...(category === "Top Rated" ? { rating: { $gte: 3.8, $lte: 4.5 } } : {}),

      // Autonomous colleges
      ...(category === "Autonomous" ? { isAutonomous: true } : {}),
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

export const getCollegesIds = async (req, res, next) => {
  try {
    const colleges = await College.find({}, "_id").lean(); // Only fetch _id field
    const ids = colleges.map((c) => c._id.toString());
    res.json(ids);
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

    res.json({ success: true, college });
  } catch (err) {
    next(err);
  }
};

export const updateCollege = async (req, res, next) => {
  try {
    const collegeId = req.params.id;

    const existingCollege = await College.findById(collegeId);
    if (!existingCollege) {
      return res.status(404).json({ message: 'College not found' });
    }

    const formData = req.body;
    const photos = req.files || [];

    // Fix: Handle course levels and categories consistently
    const courseLevels = Array.isArray(formData.courseLevels)
      ? formData.courseLevels
      : formData.courseLevels
      ? [formData.courseLevels]
      : [];

    const categories = Array.isArray(formData['categories[]'])
      ? formData['categories[]']
      : formData['categories[]']
      ? [formData['categories[]']]
      : [];

    // Fix: Handle existing images properly
    let finalPhotos = [];
    
    // Parse existing images from frontend
    if (formData.existingImages) {
      try {
        const existingImages = JSON.parse(formData.existingImages);
        finalPhotos = [...existingImages];
      } catch (err) {
        console.error('Error parsing existing images:', err);
        finalPhotos = [...(existingCollege.photos || [])];
      }
    }

    // Add new uploaded photos
    if (photos && photos.length > 0) {
      for (const file of photos) {
        const result = await uploadToCloudinary(file.buffer);
        finalPhotos.push({ 
          url: result.secure_url, 
          public_id: result.public_id 
        });
      }
    }

    // Only update the fields that are provided
    const updatedFields = {
      name: formData.name,
      universityId: formData.universityId || null,
      rating: Number(formData.rating) || 0,
      location: formData.location || '',
      isAutonomous: formData.isAutonomous === 'true' || formData.isAutonomous === true,
      courseLevels,
      category: categories, // Use 'category' field consistently
      description: formData.description,
      feeFrom: Number(formData.feeFrom),
      feeUpto: Number(formData.feeUpto),
      photos: finalPhotos, // Include both existing and new photos
    };

    const updatedCollege = await College.findByIdAndUpdate(
      collegeId, 
      updatedFields, 
      { new: true }
    );

    return res.json({ success: true, college: updatedCollege });
  } catch (err) {
    console.error('Error updating college:', err);
    next(err);
  }
};


export const deleteCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: "College not found" });
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

    res.json({ message: "College deleted successfully" });
  } catch (err) {
    next(err);
  }
};
