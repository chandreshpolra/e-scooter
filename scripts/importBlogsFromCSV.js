const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/e-scooter.blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const importBlogsFromCSV = async (csvFilePath) => {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        // Only add rows that have both title and slug
        if (data.title && data.title.trim() !== '' && data.slug && data.slug.trim() !== '') {
          // Clean and validate schema data
          if (data.blogPostingSchema && data.blogPostingSchema.trim() !== '') {
            try {
              // Validate JSON format
              JSON.parse(data.blogPostingSchema);
            } catch (e) {
              console.log(`Invalid blogPostingSchema JSON for ${data.title}:`, e.message);
              data.blogPostingSchema = ''; // Clear invalid data
            }
          }
          
          if (data.authorSchema && data.authorSchema.trim() !== '') {
            try {
              JSON.parse(data.authorSchema);
            } catch (e) {
              console.log(`Invalid authorSchema JSON for ${data.title}:`, e.message);
              data.authorSchema = '';
            }
          }
          
          if (data.faqSchema && data.faqSchema.trim() !== '') {
            try {
              JSON.parse(data.faqSchema);
            } catch (e) {
              console.log(`Invalid faqSchema JSON for ${data.title}:`, e.message);
              data.faqSchema = '';
            }
          }
          
          results.push(data);
        }
      })
      .on('end', async () => {
        try {
          console.log(`Found ${results.length} valid blogs to import`);
          
          for (const blogData of results) {
            console.log(`Processing blog: ${blogData.title}`);
            
            // Generate slug if it's missing or empty
            let slug = blogData.slug;
            if (!slug || slug.trim() === '') {
              slug = blogData.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
              console.log(`Generated slug for ${blogData.title}: ${slug}`);
            }
            
            // Prepare blog object with proper schema handling
            const blog = {
              title: blogData.title,
              slug: slug,
              content: blogData.content || '',
              excerpt: blogData.excerpt || '',
              category: blogData.category || 'Technology',
              image: blogData.image || '/images/ev-logo.png',
              image2: blogData.image2 || '/images/ev-logo.png',
              image3: blogData.image3 || '/images/ev-logo.png',
              isActive: blogData.isActive === 'TRUE' || blogData.isActive === true,
              metaTitle: blogData.metaTitle || blogData.title,
              metaDescription: blogData.metaDescription || blogData.excerpt,
              metaTags: blogData.metaTags || 'blog, automobile, technology',
              authorName: blogData.authorName || 'e-scooter.blog Team',
              authorTitle: blogData.authorTitle || 'EV Specialist',
              authorBio: blogData.authorBio || 'Expert in electric vehicles and sustainable mobility solutions.',
              canonicalUrl: blogData.canonicalUrl || `https://e-scooter.blog/blogs/${slug}`,
              publishedDate: new Date(blogData.publishedDate || Date.now()),
              // Schema fields - ensure they're properly handled
              blogPostingSchema: blogData.blogPostingSchema && blogData.blogPostingSchema.trim() !== '' ? blogData.blogPostingSchema : null,
              authorSchema: blogData.authorSchema && blogData.authorSchema.trim() !== '' ? blogData.authorSchema : null,
              faqSchema: blogData.faqSchema && blogData.faqSchema.trim() !== '' ? blogData.faqSchema : null,
              ogTitle: blogData.ogTitle || blogData.metaTitle || blogData.title,
              ogDescription: blogData.ogDescription || blogData.metaDescription || blogData.excerpt,
              ogImage: blogData.ogImage || blogData.image,
              ogUrl: blogData.ogUrl || `https://e-scooter.blog/blogs/${slug}`,
              twitterTitle: blogData.twitterTitle || blogData.metaTitle || blogData.title,
              twitterDescription: blogData.twitterDescription || blogData.metaDescription || blogData.excerpt,
              twitterImage: blogData.twitterImage || blogData.image
            };
            
            // Debug: Log schema data
            console.log(`Schema data for ${blogData.title}:`);
            console.log('- blogPostingSchema length:', blog.blogPostingSchema ? blog.blogPostingSchema.length : 0);
            console.log('- authorSchema length:', blog.authorSchema ? blog.authorSchema.length : 0);
            console.log('- faqSchema length:', blog.faqSchema ? blog.faqSchema.length : 0);
            
            try {
              // Check if blog exists
              const existingBlog = await Blog.findOne({ slug: slug });
              
              if (existingBlog) {
                // Update existing blog
                await Blog.findOneAndUpdate(
                  { slug: slug },
                  { $set: blog },
                  { new: true, runValidators: true }
                );
                console.log(`Updated blog: ${blog.title}`);
              } else {
                // Create new blog
                await Blog.create(blog);
                console.log(`Created new blog: ${blog.title}`);
              }
            } catch (dbError) {
              console.error(`Error processing blog ${blogData.title}:`, dbError.message);
              // Continue with next blog instead of stopping
              continue;
            }
          }
          
          console.log('CSV import completed successfully');
          resolve(results);
        } catch (error) {
          console.error('Error importing blogs:', error);
          reject(error);
        }
      })
      .on('error', reject);
  });
};

// Run import if called directly
if (require.main === module) {
  const csvPath = process.argv[2] || './Final Blogs.csv';
  
  importBlogsFromCSV(csvPath)
    .then(() => {
      console.log('Import completed');
      mongoose.connection.close();
    })
    .catch((error) => {
      console.error('Import failed:', error);
      mongoose.connection.close();
    });
}

module.exports = importBlogsFromCSV;
