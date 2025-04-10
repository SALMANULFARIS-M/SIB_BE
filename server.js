import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoute from "./routes/user_routes.js";
import adminRoute from "./routes/admin_routes.js";
import dotenv from "dotenv";

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
app.use("/education", userRoute);
app.use("/admin/sib", adminRoute);


// Error Handling Middleware
app.use((err, req, res, next) => {

  // Customize error response based on error type
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({ success: false, message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
