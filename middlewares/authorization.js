const isActive = (req, res, next) => {
    if (!req.user.isActive) {
        return res.status(403).json({ message: "Forbidden, your account is not active!" });
    }
    next();
}

const isBlocked = (req, res, next) => {
    if (req.user.isBlocked) {
        return res.status(403).json({ message: "Forbidden, your account is permanently banned!" });
    }
    next();
}

const isVerified = (req, res, next) => {
    if (!req.user.isVerified) {
        return res.status(403).json({ message: "Forbidden, your account is not verified!" });
    }
    next();
}

module.exports = {
    isActive,
    isBlocked,
    isVerified
}