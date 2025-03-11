import { v2 as cloudinary } from "cloudinary";
import jwt from 'jsonwebtoken';
import  Blog  from "../models/blog.js";


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Admin-related functions (e.g., add college, update college)
// export const addCollege = async (req, res) => {
//   const { name, courses, location } = req.body;
//   const newCollege = new College({ name, courses, location });

//   try {
//     const savedCollege = await newCollege.save();
//     res.status(201).json(savedCollege);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// Add other admin-related functions (e.g., update, delete)


export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    // Fetch credentials from environment variables
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const JWT_SECRET = process.env.JWT_SECRET;

    // Validate credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2d' }); // Token valid for 1 day
        res.status(200).json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }
};


// ✅ Add Blog (with Image Upload)
export const addBlog = async (req, res) => {
  try {
    
    const { title, author, content } = req.body;

    if (!req.file) {
      console.log("cause");
      return res.status(400).json({ error: "No image uploaded" });
    }

    // ✅ Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: "blogs" }, // Stores inside "blogs/" folder
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      upload.end(req.file.buffer); // Pass file buffer to Cloudinary
    });

    // ✅ Save the blog in MongoDB
    const newBlog = new Blog({
      title,
      author,
      content:JSON.parse(content),
      featuredImage: uploadResult.secure_url, // Store image URL
    });

    await newBlog.save();
    res.status(201).json({success:true, message: "Blog added successfully", blog: newBlog });
  } catch (err) {
    console.log("error:-----",err);
    res.status(500).json({ error: "Server error" }  );
  }
};

// ✅ List All Blogs
export const listBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ publishedDate: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get Blog by Slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
// ✅ Get Blog by Slug
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Edit Blog (with Optional Image Upload)
export const editBlog = async (req, res) => {
  try {
    const { title, slug, author, content } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    let imageUrl = blog.featuredImage; // Keep old image by default

    if (req.file) {
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
    }

    // ✅ Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, slug, author, content, featuredImage: imageUrl },
      { new: true }
    );

    res.json({ message: "Blog updated successfully", updatedBlog });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Delete Blog (Remove from DB + Cloudinary)
export const deleteBlog = async (req, res,next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // ✅ Extract Public ID from Cloudinary URL
    const publicId = blog.featuredImage.split("/").pop().split(".")[0];

    // ✅ Delete image from Cloudinary
    await cloudinary.uploader.destroy(`blogs/${publicId}`);

    // ✅ Delete blog from MongoDB
    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    next(err); // Pass the error to the global error handler
    res.status(500).json({ error: "Server error" });
  }
};

  