import University from "../models/university.js";
import College from "../models/college.js";
import cloudinary from "../config/cloudinary.js";

export const addUniversity = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    // ✅ Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: "universities" }, // Stores inside "blogs/" folder
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      upload.end(req.file.buffer); // Pass file buffer to Cloudinary
    });
    const university = new University({
      name,
      description,
      logo: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
    });
    await university.save();
    res.status(201).json(university);
  } catch (err) {
    next(err);
  }
};

export const getUniversityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const university = await University.findById(id)
      .populate("Colleges")
      .lean();

    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    res.status(200).json({ university, success: true });
  } catch (err) {
    next(err);
  }
};

export const getUniversitiesIds= async (req, res, next) => {
  try {
    const universities = await University.find({}, '_id').lean(); // Only fetch _id field
    const ids = universities.map(c => c._id.toString());
    res.json(ids);
  } catch (err) {
    next(err);
  }
};

export const getUniversities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";

    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    if (!page || !limit) {
      // No pagination – return full list (for admin dropdowns etc.)
      const universities = await University.find(searchQuery)
        .populate("colleges")
        .lean();

      return res.status(200).json({
        success: true,
        universities,
        total: universities.length,
      });
    }

    const skip = (page - 1) * limit;

    const universities = await University.find(searchQuery)
      .populate("colleges")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await University.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      universities,
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

export const getUniversityWithColleges = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    const category = req.query.category || "";

    // Validate university
    const university = await University.findById(id).lean();
    if (!university) {
      return res
        .status(404)
        .json({ success: false, message: "University not found" });
    }

    // Construct search and filter conditions
    const searchQuery = {
      universityId: id,
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { location: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
      ...(category &&
      category !== "All" &&
      category !== "Top Rated" &&
      category !== "Autonomous"
        ? { category: { $in: [category] } }
        : {}),
      ...(category === "Top Rated" ? { rating: { $gte: 3.8, $lte: 4.5 } } : {}),
      ...(category === "Autonomous" ? { isAutonomous: true } : {}),
    };

    // No pagination: return all matching colleges
    if (!page || !limit) {
      const colleges = await College.find(searchQuery)
        .populate("availableCourses")
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        university,
        colleges,
        totalColleges: colleges.length,
      });
    }

    const skip = (page - 1) * limit;

    const [colleges, total] = await Promise.all([
      College.find(searchQuery)
        .populate("availableCourses")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      College.countDocuments(searchQuery),
    ]);

    return res.status(200).json({
      success: true,
      university,
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

export const updateUniversity = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    let logo = university.logo;
    let imagePublicId = university.imagePublicId;

    // If a new file is uploaded, replace the existing one in Cloudinary
    if (req.file) {
      // Optionally delete old image from Cloudinary
      if (university.imagePublicId) {
        await cloudinary.uploader.destroy(university.imagePublicId);
      }

      // Upload new image
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "universities" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      logo = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    // Update the university
    university.name = name;
    university.description = description;
    university.logo = logo;
    university.imagePublicId = imagePublicId;

    const updated = await university.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const deleteUniversity = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    // If university has a Cloudinary public_id, delete the image
    if (university.imagePublicId) {
      await cloudinary.uploader.destroy(university.imagePublicId);
    }

    await University.findByIdAndDelete(req.params.id);

    res.json({ message: "University and image deleted" });
  } catch (err) {
    next(err);
  }
};
