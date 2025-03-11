import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoute from "./routes/user_routes.js";
import adminRoute from "./routes/admin_routes.js";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS options (Update allowed origins as needed)
const corsOptions = {
  origin: ["http://localhost:4200", "https://studyinbengaluru.com"], // Allow specific frontend origins
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "20mb" })); // Parses JSON requests
app.use(express.urlencoded({  limit: "20mb" ,extended: true })); // Parses URL-encoded data



// Connect to MongoDB
connectDB();

// Routes
app.use("/user", userRoute);
app.use("/admin/sib", adminRoute);



// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
