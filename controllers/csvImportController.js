const Blog = require('../models/Blog');
const importBlogsFromCSV = require('../scripts/importBlogsFromCSV');
const path = require('path');
const multer = require('multer');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Admin: Show CSV import form
exports.showCSVImportForm = async (req, res) => {
  res.render('Admin/csv-import', {
    title: 'Import Blogs from CSV',
    adminPath: req.adminPath
  });
};

// Admin: Handle CSV import
exports.importBlogs = async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'Please select a CSV file to upload');
      return res.redirect(`/${req.adminPath}/csv-import`);
    }

    const csvPath = req.file.path;
    await importBlogsFromCSV(csvPath);
    
    req.flash('success', 'Blogs imported successfully from CSV!');
    res.redirect(`/${req.adminPath}/blogs`);
  } catch (error) {
    console.error('Error importing CSV:', error);
    req.flash('error', 'Error importing blogs: ' + error.message);
    res.redirect(`/${req.adminPath}/csv-import`);
  }
};

// Admin: Handle direct CSV import from existing file
exports.importFromExistingCSV = async (req, res) => {
  try {
    const csvPath = path.join(__dirname, '..', 'final_blogs_with_new_entry.csv');
    await importBlogsFromCSV(csvPath);
    
    req.flash('success', 'Blogs imported successfully from existing CSV!');
    res.redirect(`/${req.adminPath}/blogs`);
  } catch (error) {
    console.error('Error importing CSV:', error);
    req.flash('error', 'Error importing blogs: ' + error.message);
    res.redirect(`/${req.adminPath}/blogs`);
  }
};

// API: Get import status
exports.getImportStatus = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments({});
    const activeBlogs = await Blog.countDocuments({ isActive: true });
    
    res.json({
      success: true,
      totalBlogs,
      activeBlogs,
      message: `Total blogs: ${totalBlogs}, Active blogs: ${activeBlogs}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
