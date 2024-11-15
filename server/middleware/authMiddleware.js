const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Obtener el token del encabezado
    
    if (!token) {
        return res.status(403).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Añadir la información del usuario al request
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired" });
        }
        return res.status(401).json({ error: "Invalid token" });
    }
};

const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.rol_id)) {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
};

module.exports = { verifyToken, checkRole };