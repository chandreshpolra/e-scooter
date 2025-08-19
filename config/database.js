const mongoose = require('mongoose');
require('dotenv').config();

// Use environment variable for MongoDB URI
const mongoURI = process.env.MONGODB_URL;

if (!mongoURI) {
    console.error('MONGODB_URL is not defined in environment variables');
    process.exit(1);
}

// Remove deprecated options - they're no longer needed in newer MongoDB driver versions
mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.once('connected', () => {
    console.log('Database Successfully Connected to MongoDB Atlas');
    console.log('Database name: evscooter'); 
});

module.exports = db;