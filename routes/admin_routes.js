import express from 'express';
import { getColleges } from '../controllers/collegeController.js';
import { addCollege } from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/auth.js'; // Middleware for admin authentication


const router = express.Router();

// Common route for listing colleges
router.get('/', getColleges);


// Admin routes
router.post('/add-college', authenticateAdmin, addCollege);
// Add other admin routes (e.g., update, delete)


export default router;