const Admin = require('../models/Admin');

exports.showLoginForm = (req, res) => {
    res.render('Admin/login', {
        title: 'Admin Login',
        error: req.flash('error'),
        adminPath: process.env.ADMIN_PATH || 'admin'
    });
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const adminPath = process.env.ADMIN_PATH || 'admin';

        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            req.flash('error', 'Invalid credentials');
            return res.redirect(`/${adminPath}/login`);
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid credentials');
            return res.redirect(`/${adminPath}/login`);
        }

        // Set session
        req.session.adminId = admin._id;
        res.redirect(`/${adminPath}/`);
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect(`/${adminPath}/login`);
    }
};

exports.logout = (req, res) => {
    const adminPath = process.env.ADMIN_PATH || 'admin';
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect(`/${adminPath}/login`);
    });
}; 