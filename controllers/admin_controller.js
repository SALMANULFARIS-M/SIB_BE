import jwt from 'jsonwebtoken';

// Admin-related functions (e.g., add college, update college)
// export const addCollege = async (req, res) => {
//   const { name, courses, location } = req.body;
//   const newCollege = new College({ name, courses, location });

//   try {
//     const savedCollege = await newCollege.save();
//     res.status(201).json(savedCollege);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// Add other admin-related functions (e.g., update, delete)


export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    // Fetch credentials from environment variables
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const JWT_SECRET = process.env.JWT_SECRET;

    // Validate credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2d' }); // Token valid for 1 day
        res.status(200).json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }
};
