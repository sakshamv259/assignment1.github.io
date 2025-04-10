const User = require('../models/User');

// At the top of the file, add allowed origins
const ALLOWED_ORIGINS = [
    'https://volunteer-backend-cy21.onrender.com',
    'https://assignment1-github-io.vercel.app',
    'https://sakshamv259.github.io',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5500'
];

const register = async (req, res) => {
    try {
        console.log('Register attempt:', req.body);
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.log('User already exists:', { username, email });
            return res.status(400).json({ 
                success: false,
                message: 'User already exists with this username or email' 
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();
        console.log('User created successfully:', { username, email });

        // Create session user object (excluding sensitive data)
        const userForSession = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role
        };

        // Set session data
        req.session.user = userForSession;
        req.session.authenticated = true;

        // Save session explicitly
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error during registration', 
                    error: err.message 
                });
            }

            // Log successful session creation
            console.log('Registration session created:', {
                sessionID: req.sessionID,
                user: userForSession
            });

            // Send success response
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: userForSession
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error registering user', 
            error: error.message 
        });
    }
};

const login = async (req, res) => {
    try {
        // Log complete request details (omit password for security)
        const requestBody = { ...req.body };
        if (requestBody.password) requestBody.password = '[REDACTED]';
        
        console.log('[Auth] Login request:', {
            body: requestBody,
            headers: {
                origin: req.headers.origin,
                'content-type': req.headers['content-type'],
                cookie: req.headers.cookie ? '[PRESENT]' : '[NONE]'
            },
            ip: req.ip,
            sessionID: req.sessionID,
            hasSession: !!req.session
        });

        // Validate request body
        if (!req.body) {
            console.error('[Auth] No request body received');
            return res.status(400).json({
                success: false,
                message: 'No request body received'
            });
        }

        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            console.log('[Auth] Missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user (with error handling)
        let user;
        try {
            user = await User.findOne({ username });
            console.log('[Auth] User lookup result:', {
                found: !!user,
                username
            });
        } catch (dbError) {
            console.error('[Auth] Database error during user lookup:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }

        if (!user) {
            console.log('[Auth] User not found:', username);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Check password (with error handling)
        let isMatch = false;
        try {
            isMatch = await user.comparePassword(password);
            console.log('[Auth] Password check result:', {
                isMatch,
                username
            });
        } catch (passwordError) {
            console.error('[Auth] Password comparison error:', passwordError);
            return res.status(500).json({
                success: false,
                message: 'Authentication error occurred'
            });
        }

        if (!isMatch) {
            console.log('[Auth] Invalid password for user:', username);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Create cleaned user object for session
        const userForSession = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role
        };

        // Verify session middleware
        if (!req.session) {
            console.error('[Auth] Session middleware not available');
            return res.status(500).json({
                success: false,
                message: 'Session handling error'
            });
        }

        // Set session data
        req.session.user = userForSession;
        req.session.authenticated = true;
        req.session.createdAt = new Date();

        // Set secure cookie options
        if (process.env.NODE_ENV === 'production') {
            req.session.cookie.secure = true;
            req.session.cookie.sameSite = 'none';
        }

        // Save session
        try {
            await new Promise((resolve, reject) => {
                req.session.save(err => {
                    if (err) {
                        console.error('[Auth] Session save error:', err);
                        reject(err);
                    } else {
                        console.log('[Auth] Session saved successfully:', {
                            sessionID: req.sessionID,
                            user: userForSession.username
                        });
                        resolve();
                    }
                });
            });
        } catch (sessionError) {
            console.error('[Auth] Failed to save session:', sessionError);
            // Continue anyway - send success but log the error
            console.warn('[Auth] Continuing despite session save error');
        }

        console.log('[Auth] Login successful:', {
            user: userForSession.username,
            sessionID: req.sessionID
        });

        // Return success response with user data
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userForSession
        });
    } catch (error) {
        console.error('[Auth] Uncaught login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const logout = (req, res) => {
    if (req.session) {
        console.log('Logging out user:', {
            sessionID: req.sessionID,
            username: req.session?.user?.username
        });

        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error logging out', 
                    error: err.message 
                });
            }
            res.json({ 
                success: true, 
                message: 'Logged out successfully' 
            });
        });
    } else {
        res.json({ 
            success: true, 
            message: 'Already logged out' 
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        console.log('Get current user request:', {
            sessionID: req.sessionID,
            session: req.session,
            authenticated: req.session?.authenticated
        });

        if (!req.session?.authenticated || !req.session?.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        const user = await User.findById(req.session.user.id);
        if (!user) {
            // Clear invalid session
            req.session.destroy();
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Return user data from session to avoid unnecessary database queries
        res.json({ 
            success: true,
            user: req.session.user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching user', 
            error: error.message 
        });
    }
};

const verifySession = async (req, res) => {
    try {
        console.log('[Auth] Verifying session:', {
            sessionID: req.sessionID,
            hasSession: !!req.session,
            isAuthenticated: !!(req.session && req.session.user),
            headers: req.headers
        });

        // Check if session exists and is authenticated
        if (!req.session || !req.session.user) {
            console.log('[Auth] No valid session found');
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // Look up the user to make sure they still exist
        try {
            const user = await User.findById(req.session.user.id, '-password');
            
            if (!user) {
                console.log('[Auth] User not found in database, clearing session');
                req.session.destroy();
                return res.status(401).json({
                    success: false,
                    message: 'User no longer exists'
                });
            }

            console.log('[Auth] Session verified for user:', user.username);
            
            // Refresh session to extend expiry time
            req.session.touch();

            // Return success with user data
            return res.json({
                success: true,
                message: 'Session is valid',
                user: {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (dbError) {
            console.error('[Auth] Database error verifying user:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Error verifying user'
            });
        }
    } catch (error) {
        console.error('[Auth] Session verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    verifySession
}; 