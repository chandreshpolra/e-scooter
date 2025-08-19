const path = require('path');
require('dotenv').config({ 
  path: path.resolve(__dirname, '../.env') 
});
const mongoose = require('mongoose');
const TechnologyItem = require('../models/TechnologyItem');
const fs = require('fs');
const Blog = require('../models/Blog'); // Add this line at the top with other requires

// Debug function to log environment variables
function debugEnvironment() {
  console.log('Current Working Directory:', process.cwd());
  console.log('__dirname:', __dirname);
  console.log('Env File Path:', path.resolve(__dirname, '../.env'));
  
  // Try to read .env file contents
  try {
    const envPath = path.resolve(__dirname, '../.env');
    const envContents = fs.readFileSync(envPath, 'utf8');
    console.log('Env File Contents:\n', envContents);
  } catch (error) {
    console.error('Error reading .env file:', error);
  }

  // Log all environment variables
  console.log('Process Env Variables:');
  Object.keys(process.env).forEach(key => {
    if (key.includes('MONGODB') || key === 'PORT') {
      console.log(`${key}: ${process.env[key]}`);
    }
  });
}

// Initial seed data with corrected URLs
const initialTechnologyItems = [
  {
    letter: 'A',
    category: 'Technology',
    items: [
      {
        name: 'API',
        description: 'Application Programming Interface - A set of protocols, routines, and tools for building software applications.',
        url: 'https://en.wikipedia.org/wiki/API'
      },
      {
        name: 'AI',
        description: 'Artificial Intelligence - Intelligence demonstrated by machines, unlike natural intelligence shown by humans and animals.',
        url: 'https://en.wikipedia.org/wiki/Artificial_intelligence'
      },
      {
        name: 'AJAX',
        description: 'Asynchronous JavaScript and XML - A technique for creating fast and dynamic web pages.',
        url: 'https://en.wikipedia.org/wiki/Ajax'
      }
    ]
  },
  {
    letter: 'B',
    category: 'Business',
    items: [
      {
        name: 'B2B',
        description: 'Business to Business - A business model where businesses exchange goods or services.',
        url: 'https://en.wikipedia.org/wiki/Business-to-business'
      },
      {
        name: 'BPM',
        description: 'Business Process Management - A discipline that uses various methods to discover, model, analyze, measure, improve, and optimize business processes.',
        url: 'https://en.wikipedia.org/wiki/Business_process_management'
      }
    ]
  },
  {
    letter: 'C',
    category: 'Technology',
    items: [
      {
        name: 'CPU',
        description: 'Central Processing Unit - The primary component of a computer that performs most of the processing.',
        url: 'https://en.wikipedia.org/wiki/Central_processing_unit'
      },
      {
        name: 'CSS',
        description: 'Cascading Style Sheets - A style sheet language used for describing the presentation of a document written in HTML.',
        url: 'https://en.wikipedia.org/wiki/CSS'
      }
    ]
  },
  {
    letter: 'D',
    category: 'Education',
    items: [
      {
        name: 'DLP',
        description: 'Digital Learning Platform - An online system that supports educational delivery and management.',
        url: 'https://en.wikipedia.org/wiki/Learning_management_system'
      }
    ]
  },
  {
    letter: 'E',
    category: 'Health',
    items: [
      {
        name: 'EHR',
        description: 'Electronic Health Record - A digital version of a patient\'s paper chart.',
        url: 'https://en.wikipedia.org/wiki/Electronic_health_record'
      }
    ]
  },
  {
    letter: 'G',
    category: 'Government',
    items: [
      {
        name: 'GDP',
        description: 'Gross Domestic Product - A monetary measure of the market value of all final goods and services produced.',
        url: 'https://en.wikipedia.org/wiki/Gross_domestic_product'
      }
    ]
  }
];

// Seed Database Function
async function fixBlogDates() {
  try {
    console.log('Starting blog dates fix...');
    
    // Find all blogs
    const blogs = await Blog.find({});
    console.log(`Found ${blogs.length} blogs to process`);

    let fixedCount = 0;
    const currentDate = new Date();

    for (const blog of blogs) {
      let needsUpdate = false;
      
      // Check if createdAt is missing or invalid
      if (!blog.createdAt || isNaN(new Date(blog.createdAt).getTime())) {
        console.log(`Fixing blog: ${blog.title} - Missing or invalid createdAt`);
        blog.createdAt = currentDate;
        needsUpdate = true;
      }

      // Check if updatedAt is missing or invalid
      if (!blog.updatedAt || isNaN(new Date(blog.updatedAt).getTime())) {
        console.log(`Fixing blog: ${blog.title} - Missing or invalid updatedAt`);
        blog.updatedAt = currentDate;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await blog.save();
        fixedCount++;
        console.log(`Fixed blog: ${blog.title}`);
      }
    }

    console.log(`\nBlog Dates Fix Summary:`);
    console.log(`Total blogs processed: ${blogs.length}`);
    console.log(`Blogs fixed: ${fixedCount}`);
    console.log(`Blogs already correct: ${blogs.length - fixedCount}`);
    
    return fixedCount;
  } catch (error) {
    console.error('Error fixing blog dates:', error);
    throw error;
  }
}

// Modify the existing seedDatabase function to also fix blog dates
async function seedDatabase() {
  // Debug environment
  debugEnvironment();

  try {
    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI;

    // Validate connection string
    if (!mongoUri) {
      throw new Error('MongoDB connection string is not defined in .env file. Please check your .env configuration.');
    }

    // Manually parse connection string
    const parseMongoUri = (uri) => {
      try {
        // Remove protocol and split remaining parts
        const cleanUri = uri.replace('mongodb+srv://', '');
        const [userPass, hostPath] = cleanUri.split('@');
        const [username, password] = userPass.split(':');
        const [hostDatabase, ...queryParams] = hostPath.split('?');
        const [hostname, database] = hostDatabase.split('/');

        return {
          username: decodeURIComponent(username),
          password: decodeURIComponent(password),
          hostname,
          database: database || 'test',
          fullConnectionString: `mongodb+srv://${userPass}@${hostPath}`
        };
      } catch (error) {
        console.error('Error parsing connection string:', error);
        throw new Error('Invalid MongoDB connection string format');
      }
    };

    // Parse connection string
    const parsedUri = parseMongoUri(mongoUri);

    // Connect to MongoDB
    await mongoose.connect(parsedUri.fullConnectionString, {
      // No deprecated options
    });
    console.log('Connected to MongoDB successfully');

    // Clear existing data
    await TechnologyItem.deleteMany({});
    console.log('Cleared existing technology items');

    // Validate items before insertion
    const validatedItems = initialTechnologyItems.map(item => ({
      ...item,
      items: item.items.map(subItem => ({
        ...subItem,
        url: subItem.url || '' // Ensure URL is either a valid string or empty
      }))
    }));

    // Insert seed data
    const insertedItems = await TechnologyItem.insertMany(validatedItems);
    console.log(`Inserted ${insertedItems.length} technology items`);

    // Add blog dates fix
    await fixBlogDates();

    // Close the connection
    await mongoose.connection.close();
    console.log('Database seeding and blog dates fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    
    // Provide more detailed error information
    if (error.name === 'ValidationError') {
      console.error('Validation Error Details:');
      Object.keys(error.errors).forEach(key => {
        console.error(`${key}: ${error.errors[key].message}`);
      });
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error. Check your connection string and internet connection.');
    } else {
      console.error('Detailed error:', error.message);
    }
    
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase(); 