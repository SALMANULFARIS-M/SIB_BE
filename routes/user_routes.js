import express from 'express';
import { registerUser , loginUser, apply, counceling  } from '../controllers/user_controller.js';

const router = express.Router();

// User registration and login routes
router.post('/register', registerUser );
router.post('/login', loginUser );
router.post('/apply', apply );
router.post('/counceling', counceling );
router.post('/contact', contact );

export default router;      