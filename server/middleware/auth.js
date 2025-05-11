import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Check token in these locations:
  const token = req.header('x-auth-token') || 
               req.cookies?.token || 
               req.headers?.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token found' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded.user || decoded; // Works with both formats
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid/expired token' 
    });
  }
};

export default auth;