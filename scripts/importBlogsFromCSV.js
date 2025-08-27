const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');

// MongoDB connection (adjust credentials as needed)
mongoose.connect('mongodb+srv://username:password@cluster.mongodb.net/dbname', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const importBlogsFromCSV = async (csvFilePath) => {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        if (data.title && data.slug) results.push(data);
      })
      .on('end', async () => {
        try {
          for (const blogData of results) {
            // ✅ Parse faqSchema safely
            let faqSchemaParsed = null;
            if (blogData.faqSchema && blogData.faqSchema.trim() !== '') {
              try {
                faqSchemaParsed = JSON.parse(blogData.faqSchema);
              } catch (e) {
                console.error('Invalid faqSchema JSON for', blogData.title);
                faqSchemaParsed = null;
              }
            }

            const blogObj = {
              title: blogData.title,
              slug: blogData.slug || blogData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              content: blogData.content || '',
              excerpt: blogData.excerpt || '',
              category: blogData.category || 'Technology',
              image: blogData.image || '/images/ev-logo.png',
              isActive: blogData.isActive === 'TRUE' || blogData.isActive === true,
              metaTitle: blogData.metaTitle || blogData.title,
              metaDescription: blogData.metaDescription || blogData.excerpt,
              authorName: blogData.authorName || 'e-scooter.blog Team',
              authorTitle: blogData.authorTitle || 'EV Specialist',
              authorBio: blogData.authorBio || '',
              canonicalUrl: blogData.canonicalUrl || `https://e-scooter.blog/blogs/${blogData.slug}`,
              publishedDate: blogData.publishedDate ? new Date(blogData.publishedDate) : new Date(),
              faqSchema: faqSchemaParsed, // ✅ Store parsed JSON
              ogTitle: blogData.ogTitle || blogData.metaTitle || blogData.title,
              ogDescription: blogData.ogDescription || blogData.metaDescription || blogData.excerpt,
              ogImage: blogData.ogImage || blogData.image,
              ogUrl: blogData.ogUrl || `https://e-scooter.blog/blogs/${blogData.slug}`,
              twitterTitle: blogData.twitterTitle || blogData.metaTitle || blogData.title,
              twitterDescription: blogData.twitterDescription || blogData.metaDescription || blogData.excerpt,
              twitterImage: blogData.twitterImage || blogData.image
            };

            // ✅ Upsert: update if slug exists, else create
            await Blog.findOneAndUpdate(
              { slug: blogObj.slug },
              { $set: blogObj },
              { upsert: true, new: true, runValidators: true }
            );
          }

          console.log('CSV import completed successfully ✅');
          resolve(results);
        } catch (error) {
          console.error('Error importing blogs:', error);
          reject(error);
        }
      })
      .on('error', reject);
  });
};

module.exports = importBlogsFromCSV;
