import { v2 as cloudinary } from "cloudinary";
import jwt from 'jsonwebtoken';
import  Blog  from "../models/blog.js";


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to parse list-like strings into arrays
const parseListString = (text) => {
  // Match lines starting with numbers or bullets (e.g., "1.", "•", etc.)
  const listItems = text.split(/\n+/).map((item) => item.trim()).filter((item) => item);
  // Remove numbering or bullets (e.g., "1.", "•")
  return listItems.map((item) => item.replace(/^\s*(\d+\.|\•)\s*/, ""));
};


export const loginAdmin = async (req, res,next) => {
  const { email, password } = req.body;

  // Fetch credentials from environment variables
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const JWT_SECRET = process.env.JWT_SECRET;

  // Validate environment variables
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(500).json({ success: false, message: "Server configuration error" });
  }

  try {
    // Validate credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate JWT token
        const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "2d" }); // Token valid for 2 days

      // Send success response
      return res.status(200).json({ success: true, message: "Login successful", token });
    } else {
      // Send error response for invalid credentials
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    next(error);
  }
}

// ✅ Add Blog (with Image Upload)
export const addBlog = async (req, res,next) => {
  try {
    const { title, author, content, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // ✅ Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: "blogs" }, // Stores inside "blogs/" folder
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

    // ✅ Parse and process the content
    const parsedContent = JSON.parse(content).map((item) => {
      if (item.type === "list" && typeof item.data === "string") {
        // Convert list-like string into an array of strings
        return {
          ...item,
          data: parseListString(item.data),
        };
      }
      return item;
    });

    // ✅ Save the blog in MongoDB
    const newBlog = new Blog({
      title,
      author,
      category,
      content: parsedContent,
      featuredImage: uploadResult.secure_url, // Store image URL
    });

    await newBlog.save();
    res.status(201).json({ success: true, message: "Blog added successfully", blog: newBlog });
  } catch (error) {
    console.log(error);
    
    next(error); 
  }
};




// ✅ Edit Blog (with Optional Image Upload)
export const editBlog = async (req, res, next) => {
  try {
    const { title, slug, author, content } = req.body;

    // Validate required fields
    if (!title || !slug || !author || !content) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Find the blog by ID
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    let imageUrl = blog.featuredImage; // Keep old image by default

    // Handle image upload if a new file is provided
    if (req.file) {
      try {
        // ✅ Delete old Cloudinary image
        const oldPublicId = blog.featuredImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`blogs/${oldPublicId}`);

        // ✅ Upload new image to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const upload = cloudinary.uploader.upload_stream(
            { folder: "blogs" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          upload.end(req.file.buffer);
        });

        imageUrl = uploadResult.secure_url; // Update image URL
      } catch (error) {
        return res.status(500).json({ success: false, message: "Error updating image" });
      }
    }

    // ✅ Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, slug, author, content, featuredImage: imageUrl },
      { new: true, runValidators: true } // Ensure validators are run
    );

    res.status(200).json({ success: true, message: "Blog updated successfully", updatedBlog });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};


export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // ✅ Extract Public ID from Cloudinary URL (handles nested folders)
    const imageUrl = blog.featuredImage;
    const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0]; // Extract correct ID
    let cloudinaryError = null;

    // ✅ Delete image from Cloudinary (folder path included)
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      cloudinaryError = "Failed to delete image from Cloudinary";
    }

    // ✅ Delete blog from MongoDB
    await Blog.findByIdAndDelete(req.params.id);

    // ✅ Send response based on Cloudinary deletion status
    if (cloudinaryError) {
      return res.status(200).json({
        success: true,
        message: "Blog deleted successfully, but image deletion failed",
        warning: cloudinaryError,
      });
    } else {
      return res.status(200).json({ success: true, message: "Blog deleted successfully" });
    }
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};
  