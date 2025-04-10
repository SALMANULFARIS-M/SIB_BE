import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: "University" },
  rating: { type: Number, default: 0 },
  location: { type: String },
  isAutonomous: { type: Boolean, default: false },
  photos: [String], // Google image URLs
  courseLevels: [String], // ['UG', 'PG']
  availableCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  description: { type: String, required: true },
  feeFrom: { type: Number, required: true },
  feeUpto: { type: Number, required: true },
});

const College = mongoose.model("College", collegeSchema);
export default College;
