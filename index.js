require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const { isAuthenticated, isNotAuthenticated } = require('./middleware/authMiddleware');
const authController = require('./controllers/authController');
const indexRoute = require('./routes/indexRoute');
const blogRoutes = require('./routes/blogRoutes');
const fs = require('fs').promises;
require('./config/database');


// Import models
const Blog = require('./models/Blog');

const app = express();
const PORT = process.env.PORT || 3006;

const ADMIN_PATH = process.env.ADMIN_PATH || 'secure_dashboard_85490gtu4rgj';

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/test', (req, res) => res.render('test'));

app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(__dirname + '/robots.txt');
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
}));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages
app.use(flash());

// Auth routes
app.get(`/${ADMIN_PATH}/login`, isNotAuthenticated, authController.showLoginForm);
app.post(`/${ADMIN_PATH}/login`, isNotAuthenticated, authController.login);
app.post(`/${ADMIN_PATH}/logout`, isAuthenticated, authController.logout);

// Admin Dashboard
app.get(`/${ADMIN_PATH}`, isAuthenticated, async (req, res) => {
    try {
        const blogsCount = await Blog.countDocuments();

        res.render('Admin/dashboard', {
            title: 'Admin Dashboard',
            blogsCount,
            adminPath: ADMIN_PATH
        });
    } catch (error) {
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load admin dashboard',
            adminPath: ADMIN_PATH
        });
    }
});

// Mount blog routes
app.use('/blogs', blogRoutes);
app.use(`/${ADMIN_PATH}/blogs`, isAuthenticated, blogRoutes);

// Mount route modules
app.use('/', indexRoute);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong!',
        adminPath: ADMIN_PATH,
        metaTags: 'error, blog',
        metaDescription: 'An error occurred on e-scooter.blog Blog.',
        canonicalUrl: 'https://e-scooter.blog/',
        ogTitle: 'Error - e-scooter.blog Blog',
        ogDescription: 'An error occurred on e-scooter.blog Blog.',
        ogImage: 'https://e-scooter.blog/uploads/logo.jpg',
        ogUrl: 'https://e-scooter.blog/',
        jsonLdSchema: null,
        activeSlug: null,
        blogData: null
    });
});



// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});
