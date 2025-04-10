import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  degree: { type: String, required: true }, 
  level: {
    type: String,
    enum: ["UG", "PG", "Course"], // "Course" for skill-based external courses
    required: true,
  },
  category: {
    type: String,
    enum: ["Engineering", "Science", "Management", "Commerce", "Medical", "Arts", "Law", "Other"],
    required: true,
  },
  fees: { type: Number, required: true },
  durationValue: { type: Number, required: true },
  durationUnit: {
    type: String,
    enum: ["month", "year"],
    required: true,
  },
  medianLPA: { type: Number, required: true },
  affiliation: { type: String, required: true },

  // For regular college-based courses
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    default: null,
  },

  // For external/institute-based courses
  providerType: {
    type: String,
    enum: ["College", "Institute", "OnlinePlatform"],
    default: "College",
  },
  providerName: {
    type: String,
    default: null, // e.g., "Coursera", "NIIT", etc.
  },

  isOnline: { type: Boolean, default: false },
  isOffline: { type: Boolean, default: true },
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
