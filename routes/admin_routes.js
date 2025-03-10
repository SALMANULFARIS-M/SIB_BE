import express from 'express';
import { loginAdmin } from '../controllers/admin_controller.js';
// import { getColleges } from '../controllers/common_controller.js';
// import { addCollege } from '../controllers/admin_controller.js';
// import { authenticateAdmin } from '../middleware/admin_auth.js'; // Middleware for admin authentication


const router = express.Router();

// Common route for listing colleges
// router.get('/', getColleges);
router.post('/login', loginAdmin );


// Admin routes
// router.post('/add-college', authenticateAdmin, addCollege);
// Add other admin routes (e.g., update, delete)


export default router;