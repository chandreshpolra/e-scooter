const ADMIN_PATH = process.env.ADMIN_PATH || 'secure_dashboard_85490gtu4rgj';

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return next();
    }
    res.redirect(`/${ADMIN_PATH}/login`);
};

const isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return res.redirect(`/${ADMIN_PATH}`);
    }
    next();
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated
}; 