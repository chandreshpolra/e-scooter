const multer = require('multer');
const importBlogsFromCSV = require('../scripts/importBlogsFromCSV');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

exports.uploadCSV = upload.single('csvFile');

exports.importBlogs = async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'Please select a CSV file');
      return res.redirect(`/${req.adminPath}/csv-import`);
    }

    await importBlogsFromCSV(req.file.path);

    req.flash('success', 'Blogs imported successfully ✅');
    res.redirect(`/${req.adminPath}/blogs`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'CSV import failed ❌');
    res.redirect(`/${req.adminPath}/csv-import`);
  }
};
