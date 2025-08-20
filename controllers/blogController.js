const Blog = require('../models/Blog');

// Debugging logs
console.log('Blog Controller Loaded');

// Get paginated blogs for index page (6 per page)
exports.getBlogsForIndex = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalBlogs / limit);

    let blogs = await Blog.find({ isActive: true })
      .sort({ publishedDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug excerpt category image image2 createdAt publishedDate authorName authorTitle authorBio')
      .lean();

    blogs = blogs.map(blog => ({
      ...blog,
      publishedDate: blog.publishedDate
        ? new Date(blog.publishedDate).toISOString().split("T")[0]
        : null,
      createdAt: blog.createdAt
        ? new Date(blog.createdAt).toISOString().split("T")[0]
        : null
    }));

    res.render('index', {
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      title: "E-Scooter Blog",
      metaDescription: "Latest electric scooter news, reviews, guides and insights.",
      metaTags: "electric scooter, ev news, scooter reviews, electric vehicle, blog",
      canonicalUrl: "https://e-scooter.blog/",
      ogTitle: "E-Scooter Blog",
      ogDescription: "Stay updated with the latest in electric mobility and EV technology.",
      ogImage: "/uploads/logo.jpg",
      ogUrl: "https://e-scooter.blog/"
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).render('error', { message: 'Failed to fetch blogs' });
  }
};


// Get single blog by slug with exactly 2 related blogs
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      isActive: true
    });

    if (!blog) {
      return res.status(404).render('404');
    }
    const relatedBlogs = await Blog.find({
      isActive: true,
      _id: { $ne: blog._id }
    })
      .sort({ publishedDate: -1 })
      .limit(3)
      .select('title slug category image image2 createdAt publishedDate');


    res.render('blog-detail', {
      blog,
      relatedBlogs,
      title: blog.metaTitle || blog.title,
      metaDescription: blog.metaDescription || blog.excerpt,
      metaTags: blog.metaTags || 'blog, automobile, technology',
      canonicalUrl: blog.canonicalUrl || `https://e-scooter.blog/blogs/${blog.slug}`,
      ogTitle: blog.ogTitle || blog.metaTitle || blog.title,
      ogDescription: blog.ogDescription || blog.metaDescription || blog.excerpt,
      ogImage: blog.ogImage || blog.image,
      ogUrl: blog.ogUrl || `https://e-scooter.blog/blogs/${blog.slug}`,
      twitterTitle: blog.twitterTitle || blog.metaTitle || blog.title,
      twitterDescription: blog.twitterDescription || blog.metaDescription || blog.excerpt,
      twitterImage: blog.twitterImage || blog.image
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).render('error', { message: 'Failed to load blog' });
  }
};

// Admin: Get all blogs with search and filtering
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // Show 10 blogs per page
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || '';

    // console.log('Pagination Debug:', { page, limit, skip, search, category, status });

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    console.log('Total blogs:', totalBlogs, 'Total pages:', totalPages);

    // Get blogs for current page
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // console.log('Blogs found for current page:', blogs.length);

    // Get unique categories for filter dropdown
    const categories = await Blog.distinct('category');

    const paginationData = {
      blogs,
      title: 'Manage Blogs',
      adminPath: req.adminPath,
      currentPage: page,
      totalPages: totalPages,
      totalBlogs: totalBlogs,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      search: search,
      category: category,
      status: status,
      categories: categories
    };

    // console.log('Pagination data being sent to view:', paginationData);

    res.render('Admin/blogs', paginationData);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).render('error', { message: 'Failed to load blogs' });
  }
};

// Admin: Show create blog form
exports.showCreateBlogForm = async (req, res) => {
  res.render('Admin/blog-form', {
    title: 'Create New Blog',
    blog: null,
    adminPath: req.adminPath
  });
};

// Admin: Show edit blog form
exports.showEditBlogForm = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).render('error', { message: 'Blog not found' });
    }
    res.render('Admin/blog-form', {
      title: 'Edit Blog',
      blog,
      adminPath: req.adminPath
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).render('error', { message: 'Failed to load blog' });
  }
};

// Admin: Create blog
exports.createBlog = async (req, res) => {
  try {
    const {
      title, content, excerpt, category, metaTitle, metaDescription, metaTags,
      customSlug, authorName, authorTitle, authorBio, canonicalUrl, publishedDate,
      blogPostingSchema, authorSchema, faqSchema, ogTitle, ogDescription, ogImage,
      ogUrl, twitterTitle, twitterDescription, twitterImage
    } = req.body;

    let image = '/images/ev-logo.png';
    let image2 = '/images/ev-logo.png';
    let image3 = '/images/ev-logo.png';

    if (req.files && req.files.image) {
      const file = req.files.image;
      const fileName = Date.now() + '-' + file.name;
      const uploadPath = __dirname + '/../public/uploads/blogs/' + fileName;
      await file.mv(uploadPath);
      image = '/uploads/blogs/' + fileName;
    }

    if (req.files && req.files.image2) {
      const file = req.files.image2;
      const fileName = Date.now() + '-' + file.name;
      const uploadPath = __dirname + '/../public/uploads/blogs/' + fileName;
      await file.mv(uploadPath);
      image2 = '/uploads/blogs/' + fileName;
    }

    if (req.files && req.files.image3) {
      const file = req.files.image3;
      const fileName = Date.now() + '-' + file.name;
      const uploadPath = __dirname + '/../public/uploads/blogs/' + fileName;
      await file.mv(uploadPath);
      image3 = '/uploads/blogs/' + fileName;
    }
    // Use custom slug if provided, otherwise auto-generate
    let slug = customSlug;
    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    const blog = new Blog({
      title,
      slug,
      content,
      excerpt,
      category: category || 'Automobile',
      image,
      image2,
      image3,
      metaTitle,
      metaDescription,
      metaTags,
      authorName,
      authorTitle,
      authorBio,
      canonicalUrl,
      publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
      blogPostingSchema,
      authorSchema,
      faqSchema,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      twitterTitle,
      twitterDescription,
      twitterImage
    });

    await blog.save();
    req.flash('success', 'Blog created successfully!');
    res.redirect(`/${req.adminPath}/blogs`);
  } catch (error) {
    console.error('Error creating blog:', error);
    req.flash('error', 'Failed to create blog');
    res.redirect(`/${req.adminPath}/blogs/create`);
  }
};

// Admin: Update blog
exports.updateBlog = async (req, res) => {
  try {
    const {
      title, content, excerpt, category, metaTitle, metaDescription, metaTags,
      customSlug, authorName, authorTitle, authorBio, canonicalUrl, publishedDate,
      blogPostingSchema, authorSchema, faqSchema, ogTitle, ogDescription, ogImage,
      ogUrl, twitterTitle, twitterDescription, twitterImage
    } = req.body;

    const updateData = {
      title,
      content,
      excerpt,
      category: category || 'Automobile',
      metaTitle,
      metaDescription,
      metaTags,
      authorName,
      authorTitle,
      authorBio,
      canonicalUrl,
      publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
      blogPostingSchema,
      authorSchema,
      faqSchema,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      twitterTitle,
      twitterDescription,
      twitterImage
    };

    // Use custom slug if provided, otherwise auto-generate
    if (customSlug) {
      updateData.slug = customSlug;
    } else {
      updateData.slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    if (req.files && req.files.image) {
      const file = req.files.image;
      const fileName = Date.now() + '-' + file.name;
      const uploadPath = __dirname + '/../public/uploads/blogs/' + fileName;
      await file.mv(uploadPath);
      updateData.image = '/uploads/blogs/' + fileName;
    }

    if (req.files && req.files.image2) {
      const file = req.files.image2;
      const fileName = Date.now() + '-' + file.name;
      const uploadPath = __dirname + '/../public/uploads/blogs/' + fileName;
      await file.mv(uploadPath);
      updateData.image2 = '/uploads/blogs/' + fileName;
    }

    if (req.files && req.files.image3) {
      const file = req.files.image3;
      const fileName = Date.now() + '-' + file.name;
      const uploadPath = __dirname + '/../public/uploads/blogs/' + fileName;
      await file.mv(uploadPath);
      updateData.image3 = '/uploads/blogs/' + fileName;
    }
    await Blog.findByIdAndUpdate(req.params.id, updateData);
    req.flash('success', 'Blog updated successfully!');
    res.redirect(`/${req.adminPath}/blogs`);
  } catch (error) {
    console.error('Error updating blog:', error);
    req.flash('error', 'Failed to update blog');
    res.redirect(`/${req.adminPath}/blogs/${req.params.id}/edit`);
  }
};

// Admin: Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    req.flash('success', 'Blog deleted successfully!');
    res.redirect(`/${req.adminPath}/blogs`);
  } catch (error) {
    console.error('Error deleting blog:', error);
    req.flash('error', 'Failed to delete blog');
    res.redirect(`/${req.adminPath}/blogs`);
  }
};

// Admin: Toggle blog status
exports.toggleBlogStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.isActive = !blog.isActive;
    await blog.save();

    res.json({
      success: true,
      isActive: blog.isActive,
      message: `Blog ${blog.isActive ? 'activated' : 'deactivated'} successfully!`
    });
  } catch (error) {
    console.error('Error toggling blog status:', error);
    res.status(500).json({ message: 'Failed to toggle blog status' });
  }
};

// Admin: Bulk delete blogs
exports.bulkDeleteBlogs = async (req, res) => {
  try {
    const { blogIds } = req.body;

    if (!blogIds || !Array.isArray(blogIds) || blogIds.length === 0) {
      return res.status(400).json({ message: 'No blogs selected for deletion' });
    }

    await Blog.deleteMany({ _id: { $in: blogIds } });

    res.json({
      success: true,
      message: `${blogIds.length} blog(s) deleted successfully!`
    });
  } catch (error) {
    console.error('Error bulk deleting blogs:', error);
    res.status(500).json({ message: 'Failed to delete blogs' });
  }
};

// Admin: Bulk update blog status
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { blogIds, status } = req.body;

    if (!blogIds || !Array.isArray(blogIds) || blogIds.length === 0) {
      return res.status(400).json({ message: 'No blogs selected' });
    }

    const isActive = status === 'active';
    await Blog.updateMany(
      { _id: { $in: blogIds } },
      { isActive: isActive }
    );

    res.json({
      success: true,
      message: `${blogIds.length} blog(s) ${isActive ? 'activated' : 'deactivated'} successfully!`
    });
  } catch (error) {
    console.error('Error bulk updating blog status:', error);
    res.status(500).json({ message: 'Failed to update blog status' });
  }
};


// Get blogs with pagination
exports.getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments({ isActive: true });

    let blogs = await Blog.find({ isActive: true })
      .sort({ publishedDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // ✅ plain JS object dega

    blogs = blogs.map(blog => ({
      ...blog,
      publishedDate: blog.publishedDate
        ? new Date(blog.publishedDate).toISOString().split("T")[0]
        : null,
      createdAt: blog.createdAt
        ? new Date(blog.createdAt).toISOString().split("T")[0]
        : null
    }));


    res.json({
      blogs,
      pagination: {
        totalBlogs,
        currentPage: page,
        totalPages: Math.ceil(totalBlogs / limit),
        hasNextPage: page * limit < totalBlogs,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
