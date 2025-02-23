import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from './config/db.js';
import userRoute from './routes/user_routes.js';
import adminRoute from './routes/admin_routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS options
const corsOptions = {
  origin: '*', // Replace with your allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true // Allow credentials (cookies, authorization headers, etc.)
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/user',userRoute);
app.use('/admin/sib',adminRoute);
    
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
