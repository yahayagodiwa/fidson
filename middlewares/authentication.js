const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    // check token from bearer token
    let token = req.headers["authorization"];

    // check if token is present
    if(!token || !token.startsWith("Bearer")){
        return res.status(401).json({ message: "Unauthorized, token is required!" });
    }

    token = token.split(" ")[1]; // remove "Bearer" from token
    

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // check if user exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized, user not found!" });
        }
        // check if token is expired
        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({ message: "Unauthorized, token is expired!" });
        }
        
        
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized, invalid token!" });
    }
}


// check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden, you are not an admin!" });
    }
    next();
}



module.exports = {
    authMiddleware,
    isAdmin

};