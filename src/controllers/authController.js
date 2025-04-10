const User = require('../models/User');

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
        console.log('[Auth] Login attempt:', {
            body: req.body,
            headers: req.headers,
            ip: req.ip,
            origin: req.get('origin')
        });

        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            console.log('[Auth] User not found:', username);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('[Auth] Invalid password for user:', username);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

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
        req.session.createdAt = new Date();

        // Set secure cookie options for Render deployment
        if (process.env.NODE_ENV === 'production') {
            req.session.cookie.secure = true;
            req.session.cookie.sameSite = 'none';
            // Remove domain setting as it can cause issues with cross-origin
            req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
        }

        // Save session explicitly with proper error handling
        try {
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err) {
                        console.error('[Auth] Session save error:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            // Log successful login
            console.log('[Auth] Login successful:', {
                username: userForSession.username,
                sessionID: req.sessionID,
                cookie: req.session.cookie,
                headers: res.getHeaders()
            });

            // Set CORS headers for Render deployment
            const origin = req.get('origin');
            if (origin) {
                res.header('Access-Control-Allow-Origin', origin);
            }
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Session-ID');

            // Send success response with session ID
            res.status(200).json({
                success: true,
                message: 'Login successful',
                user: userForSession,
                sessionID: req.sessionID
            });
        } catch (sessionError) {
            console.error('[Auth] Session save error:', sessionError);
            return res.status(500).json({
                success: false,
                message: 'Error creating session. Please try again.',
                error: sessionError.message
            });
        }
    } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error. Please try again later.',
            error: error.message 
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
        console.log('Verify session request:', {
            sessionID: req.sessionID,
            session: req.session,
            authenticated: req.session?.authenticated,
            user: req.session?.user
        });

        // Check if session exists and is authenticated
        if (!req.session || !req.session.authenticated || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated',
                debug: {
                    hasSession: !!req.session,
                    isAuthenticated: !!req.session?.authenticated,
                    hasUser: !!req.session?.user
                }
            });
        }

        // Verify user exists in database
        const user = await User.findById(req.session.user.id);
        if (!user) {
            // Clear invalid session
            req.session.destroy();
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Return success with user data
        res.json({ 
            success: true,
            user: req.session.user
        });
    } catch (error) {
        console.error('Verify session error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error verifying session',
            debug: error.message
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