const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');

// Route to serve blog data via API from MongoDB with pagination
router.get('/api/blogs', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({ message: 'Database connection not available' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 6; // Show 6 blogs per page
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalBlogs / limit);

    const blogs = await Blog.find({ isActive: true })
      .sort({ createdAt: -1, _id: -1 }).skip(skip)
      .limit(limit)
      .select('title slug excerpt category image createdAt authorName')
      .maxTimeMS(5000);

    res.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalBlogs: totalBlogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching blog data from MongoDB:', error);
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.status(503).json({ message: 'Database temporarily unavailable' });
    }
    res.status(500).json({ message: 'Failed to fetch blog data.' });
  }
});

// Route to render index.ejs and pass data with pagination
router.get('/', async (req, res) => {
  try {
    let dynamicTitle = 'Electric Scooter News, Reviews, Guides and Insights';

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. ReadyState:', mongoose.connection.readyState);
      throw new Error('Database connection not available');
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 6; // Show 6 blogs per page
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalBlogs / limit);

    // Fetch blogs for the index page with pagination
    const blogs = await Blog.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug excerpt category image createdAt authorName')
      .maxTimeMS(5000); // 5 second timeout

    res.render('index', {
      title: dynamicTitle,
      metaTags: 'electric scooter, ev news, scooter reviews, electric vehicle, blog',
      metaDescription: 'Latest electric scooter news, reviews, guides and insights. Stay updated with the latest in electric mobility and EV technology.',
      canonicalUrl: 'https://e-scooter.blog/',
      ogTitle: 'e-scooter.blog Blog | Latest Electric Scooter News, Reviews & Guides',
      ogDescription: 'Latest electric scooter news, reviews, guides and insights. Stay updated with the latest in electric mobility and EV technology.',
      ogImage: 'https://e-scooter.blog/uploads/og-banner.jpg',
      ogUrl: 'https://e-scooter.blog/',
      jsonLdSchema: null,
      blogs: blogs,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalBlogs: totalBlogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error rendering index page:', error);

    // Handle specific database connection errors
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      console.error('Database connection timeout detected');
      return res.status(503).render('error', {
        message: 'Database temporarily unavailable. Please try again later.',
        title: 'Service Unavailable'
      });
    }

    res.status(500).render('index', {
      title: 'Electric Scooter News, Reviews, Guides and Insights',
      metaTags: 'electric scooter, ev news, scooter reviews, electric vehicle, blog',
      metaDescription: 'Latest electric scooter news, reviews, guides and insights. Stay updated with the latest in electric mobility and EV technology.',
      canonicalUrl: 'https://e-scooter.blog/',
      ogTitle: 'Electric Scooter News, Reviews, Guides and Insights',
      ogDescription: 'Latest electric scooter news, reviews, guides and insights. Stay updated with the latest in electric mobility and EV technology.',
      ogImage: 'https://e-scooter.blog/uploads/og-banner.jpg',
      ogUrl: 'https://e-scooter.blog/',
      jsonLdSchema: null,
      blogs: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  }
});

// Route to render index.ejs with pagination using clean URLs
router.get('/page/:page', async (req, res) => {
  try {
    let dynamicTitle = 'Electric Scooter News, Reviews, Guides and Insights';

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. ReadyState:', mongoose.connection.readyState);
      throw new Error('Database connection not available');
    }

    const page = parseInt(req.params.page) || 1;
    const limit = 6; // Show 6 blogs per page
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalBlogs / limit);

    // Fetch blogs for the index page with pagination
    const blogs = await Blog.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug excerpt category image createdAt authorName')
      .maxTimeMS(5000); // 5 second timeout

    res.render('index', {
      title: dynamicTitle,
      metaTags: 'electric scooter, ev news, scooter reviews, electric vehicle, blog',
      metaDescription: 'Latest electric scooter news, reviews, guides and insights. Stay updated with the latest in electric mobility and EV technology.',
      canonicalUrl: 'https://e-scooter.blog/',
      ogTitle: 'Electric Scooter News, Reviews, Guides and Insights',
      ogDescription: 'Latest electric scooter news, reviews, guides and insights. Stay updated with the latest in electric mobility and EV technology.',
      ogImage: 'https://e-scooter.blog/uploads/og-banner.jpg',
      ogUrl: 'https://e-scooter.blog/',
      jsonLdSchema: null,
      blogs: blogs,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalBlogs: totalBlogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error rendering index page:', error);

    // Handle specific database connection errors
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      console.error('Database connection timeout detected');
      return res.status(503).render('error', {
        message: 'Database temporarily unavailable. Please try again later.',
        title: 'Service Unavailable'
      });
    }

    res.status(500).render('index', {
      title: 'Electric Scooter News, Reviews, Guides and Insights',
      metaTags: 'electric scooter, ev news, scooter reviews, electric vehicle, blog',
      metaDescription: 'Latest electric scooter news, reviews, guides and insights. Stay updated with the latest in electric mobility and EV technology.',
      canonicalUrl: 'https://e-scooter.blog/',
      ogTitle: 'Electric Scooter News, Reviews, Guides and Insights',
      ogDescription: 'Latest electric scooter news, reviews, guides and insights. Stay updated with the latest in electric mobility and EV technology.',
      ogImage: 'https://e-scooter.blog/uploads/og-banner.jpg',
      ogUrl: 'https://e-scooter.blog/',
      jsonLdSchema: null,
      blogs: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  }
});

router.get('/terms-of-use', (req, res) => {
  res.render('terms-of-use');
});

router.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy');
});

router.get('/contact', (req, res) => {
  res.render('contact');
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/sitemap', async (req, res) => {
  try {
    const blogs = await Blog.find({ isActive: true })
      .sort({ title: 1 })
      .lean();

    const staticPages = [
      { path: '/', name: 'Home' },
      { path: '/about', name: 'About' },
      { path: '/contact', name: 'Contact' },
      { path: '/privacy-policy', name: 'Privacy Policy' },
      { path: '/terms-of-use', name: 'Terms of Use' }
    ];

    res.render('sitemap', { blogs, staticPages });
  } catch (error) {
    console.error('Error fetching sitemap data:', error);
    res.status(500).render('error', { message: 'Failed to generate sitemap.' });
  }
});

module.exports = router;
