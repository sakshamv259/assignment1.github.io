const isAuthenticated = (req, res, next) => {
    console.log('Auth check:', {
        hasSession: !!req.session,
        sessionID: req.sessionID,
        authenticated: req.session?.authenticated,
        hasUser: !!req.session?.user
    });

    if (req.session && req.session.authenticated && req.session.user) {
        return next();
    }

    res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        debug: {
            hasSession: !!req.session,
            isAuthenticated: !!req.session?.authenticated,
            hasUser: !!req.session?.user
        }
    });
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ success: false, message: 'Admin access required' });
};

// Add a new middleware to attach user to all responses
const attachUser = (req, res, next) => {
    console.log('Session Debug:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        authenticated: req.session?.authenticated,
        hasUser: !!req.session?.user
    });

    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
    } else {
        res.locals.user = null;
    }
    next();
};

module.exports = {
    isAuthenticated,
    isAdmin,
    attachUser
}; 