import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  description: { type: String, required: true },
  imagePublicId: { type: String },
  colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }]
});

const University = mongoose.model('University', universitySchema);
export default University;
