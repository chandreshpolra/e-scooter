const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('../config/database');

async function createOrUpdateAdmin() {
    try {
        const username = 'admin';
        const newPassword = 'Admin@123#Secure2024';

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        
        if (existingAdmin) {
            console.log('Admin user exists, updating password...');
            existingAdmin.password = newPassword;
            await existingAdmin.save();
            console.log('Admin password updated successfully');
        } else {
            // Create new admin
            const admin = new Admin({
                username,
                password: newPassword
            });
            await admin.save();
            console.log('Admin user created successfully');
        }

        console.log('Username:', username);
        console.log('Password:', newPassword);
        process.exit(0);
    } catch (error) {
        console.error('Error managing admin:', error);
        process.exit(1);
    }
}

// Wait for database connection before managing admin
mongoose.connection.once('connected', () => {
    console.log('Connected to MongoDB');
    createOrUpdateAdmin();
}); 