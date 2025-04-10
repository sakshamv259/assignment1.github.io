const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Set session
        req.session.userId = user._id;
        req.session.userRole = user.role;

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
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

        // Save session explicitly
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error during login', 
                    error: err.message 
                });
            }

            // Log successful session creation
            console.log('Session created successfully:', {
                sessionID: req.sessionID,
                user: userForSession,
                session: req.session
            });

            // Send success response with user data
            res.status(200).json({
                success: true,
                message: 'Login successful',
                user: userForSession
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error logging in', 
            error: error.message 
        });
    }
};

const logout = (req, res) => {
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