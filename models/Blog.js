const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'Automobile',
    trim: true
  },
  image: {
    type: String,
    default: '/images/ev-logo.png'
  },
  image2: {
    type: String,
    default: '/images/ev-logo.png'
  },
  image3: {
    type: String,
    default: '/images/ev-logo.png'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Author information
  authorName: {
    type: String,
    required: true,
    trim: true,
    default: 'e-scooter.blog Team'
  },
  authorTitle: {
    type: String,
    trim: true,
    default: 'EV Specialist'
  },
  authorBio: {
    type: String,
    trim: true,
    default: 'Expert in electric vehicles and sustainable mobility solutions.'
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  metaTags: {
    type: String,
    trim: true
  },
  // SEO and Meta fields
  canonicalUrl: {
    type: String,
    trim: true
  },
  publishedDate: {
    type: Date,
    required: true
  },
  // Schema.org structured data
  blogPostingSchema: {
    type: String,
    trim: true
  },
  authorSchema: {
    type: String,
    trim: true
  },
  faqSchema: {
    type: String,
    trim: true
  },
  // Open Graph meta tags
  ogTitle: {
    type: String,
    trim: true
  },
  ogDescription: {
    type: String,
    trim: true
  },
  ogImage: {
    type: String,
    trim: true
  },
  ogUrl: {
    type: String,
    trim: true
  },
  // Twitter Card meta tags
  twitterTitle: {
    type: String,
    trim: true
  },
  twitterDescription: {
    type: String,
    trim: true
  },
  twitterImage: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Create a pre-save hook to generate slug if not provided
blogSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  next();
});

// Create an index for efficient searching
blogSchema.index({ title: 1, category: 1, isActive: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model('Blog', blogSchema); 