import University from "../models/university.js";


export const addUniversity = async (req, res) => {
  try {
    const { name} = req.body;
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
    const university = new University({ name,logo: uploadResult.secure_url });
    await university.save();
    res.status(201).json(university);
  } catch (err) {
    next(err);
  }
};

export const getUniversities = async (req, res) => {
  try {
    const universities = await University.find().populate("colleges");
    res.json(universities);
  } catch (err) {
    next(err);
  }
};


export const getUniversityWithColleges = async (req, res, next) => {
  try {
    const { id } = req.params;

   
    const university = await University.findById(id).populate({
        path: "colleges",
      });

    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    res.json(university);
  } catch (err) {
    next(err);
  }
};

export const updateUniversity = async (req, res) => {
  try {
    const { name, logo } = req.body;

    const university = await University.findByIdAndUpdate(
      req.params.id,
      name, logo,
      { new: true }
    );
    res.json(university);
  } catch (err) {
    next(err);
  }
};

export const deleteUniversity = async (req, res) => {
  try {
    await University.findByIdAndDelete(req.params.id);
    res.json({ message: "University deleted" });
  } catch (err) {
    next(err);
  }
};
