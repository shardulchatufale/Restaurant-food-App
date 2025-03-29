const jwt = require('jsonwebtoken');

const authentication = async (req, res, next) => {
    try {
        let token = req.headers['authorization'] || req.headers['Authorization'];
        console.log('Token received:', token);

        if (!token) return res.status(401).json({ success: false, message: 'Token is required' });

        token = token.split(' ')[1];

        jwt.verify(token, 'Food_App', (error, decoded) => {
            if (error) {
                return res.status(401).json({ success: false, message: 'Invalid token' });
            }

            req.userId = decoded.userId;
            next();
        });
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(500).json({ success: false, message: 'Server error during authentication' });
    }
};

const authorization = async (req, res, next) => {
    try {
        const id = req.query.id;

        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID is required in query parameters' });
        }

        if (req.userId !== id) {
            return res.status(403).json({ success: false, message: 'User ID does not match token' });
        }

        next();
    } catch (err) {
        console.error('Authorization error:', err);
        res.status(500).json({ success: false, message: 'Server error during authorization' });
    }
};

module.exports = { authentication, authorization };