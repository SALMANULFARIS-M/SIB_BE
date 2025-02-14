import College from '../models/College.js';

// Get all colleges
export const getColleges = async (req, res) => {
  try {
    const colleges = await College.find();
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add other college-related functions (e.g., create, update, delete)