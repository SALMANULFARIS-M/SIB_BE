import express from 'express';
import { addBlog, deleteBlog, editBlog, loginAdmin } from '../controllers/admin_controller.js';
import upload from "../middleware/upload.js";
import { getBlogById, getBlogBySlug,listBlogs } from '../controllers/common_controller.js';


const router = express.Router();
// Multer setup for handling file uploads


// Admin Login
router.post('/login', loginAdmin );
// Blog Routes
router.post('/addblog', upload.single("featuredImage"), addBlog);  // ✅ Add Blog with Image
router.get('/blogs', listBlogs);  // ✅ List All Blogs
router.get('/blogs/:id',getBlogById );  // ✅ Get Blog by Slug
router.put('/editblog/:id', upload.single("featuredImage"), editBlog);  // ✅ Edit Blog with Optional Image
router.delete('/deleteblog/:id', deleteBlog);  // ✅ Delete Blog & Remove Image from Cloudinary
router.get('/getslug/:slug',getBlogBySlug)





// Admin routes
// router.post('/add-college', authenticateAdmin, addCollege);
// Add other admin routes (e.g., update, delete)


export default router;