import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from './config/db.js';
import userRoute from './routes/user_routes.js';
import adminRoute from './routes/admin_routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
