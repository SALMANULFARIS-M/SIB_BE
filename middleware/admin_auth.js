export const authenticateAdmin = (req, res, next) => {
    // Implement your admin authentication logic here
    // For example, check if the user is an admin
    const isAdmin = true; // Replace with actual logic
  
    if (!isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
  
    next();
  };