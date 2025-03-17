// import College from '../models/College.js';
import  Blog  from "../models/blog.js";


// ✅ Get Blog by Slug
export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });    
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    res.status(200).json( blog );
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};


// ✅ Get Blog by ID
export const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, blog });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};

// ✅ List Blogs (with Pagination)
export const listBlogs = async (req, res, next) => {
  try {    
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 blogs per page
    const search = req.query.search || ""; // Get search query
    const skip = (page - 1) * limit;

    // Search Query - Case-insensitive search on title and content
    const searchQuery = search
      ? { $or: [{ title: { $regex: search, $options: "i" } }, { "content.data": { $regex: search, $options: "i" } }] }
      : {};

    // Fetch blogs with search and pagination
    const blogs = await Blog.find(searchQuery)
      .sort({ publishedDate: -1 }) // Sort by latest first
      .skip(skip)
      .limit(limit)
      .lean(); // Using `.lean()` for faster performance

    const totalBlogs = await Blog.countDocuments(searchQuery); // Total blogs after filtering

    res.status(200).json({
      success: true,
      blogs,
      pagination: {
        page,
        limit,
        total: totalBlogs,
        totalPages: Math.ceil(totalBlogs / limit),
      },
    });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};
