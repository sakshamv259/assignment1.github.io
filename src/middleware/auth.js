const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Authentication required' });
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ success: false, message: 'Admin access required' });
};

// Add a new middleware to attach user to all responses
const attachUser = (req, res, next) => {
    // Debug session information
    console.log('Session Debug:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        sessionUser: req.session?.user
    });

    res.locals.user = req.session?.user || null;
    next();
};

module.exports = {
    isAuthenticated,
    isAdmin,
    attachUser
}; 