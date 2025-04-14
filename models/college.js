import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: "University" },
  rating: { type: Number, default: 0 },
  location: { type: String },
  isAutonomous: { type: Boolean, default: false },
  photos: [
    {
      url: String,
      public_id: String
    }
  ],
  courseLevels: [String], // ['UG', 'PG']
  availableCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  description: { type: String, required: true },
  feeFrom: { type: Number, required: true },
  feeUpto: { type: Number, required: true },

  // 👇 Multiple categories with enum
  category: {
    type: [String],
    enum: [
      "Engineering",
      "Science",
      "Management",
      "Commerce",
      "Medical",
      "Pharmacy",
      "Nursing",
      "IT",
      "Arts",
      "Law",
      "Architecture",
      "Design",
      "Hotel Management",
      "Journalism",
      "Education",
      "Paramedical",
      "Aviation",
      "Vocational",
      "Short-Term",
      "Other",
    ],
    default: ["Other"]
  },
});

const College = mongoose.model("College", collegeSchema);
export default College;
