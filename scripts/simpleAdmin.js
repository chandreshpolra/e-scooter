const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define Admin Schema (kyunki mongoose.models.Admin available nahi hoga)
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create Admin model
const Admin = mongoose.model('Admin', adminSchema);

async function createSimpleAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/e-scooter.blog-blog');
        console.log('Connected to MongoDB successfully!');
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin already exists, updating password...');
            existingAdmin.password = await bcrypt.hash('admin123', 10);
            await existingAdmin.save();
            console.log('Admin password updated successfully!');
        } else {
            // Create new admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            const admin = new Admin({
                username: 'admin',
                password: hashedPassword
            });
            
            await admin.save();
            console.log('Admin created successfully!');
        }
        
        console.log('\n=== ADMIN CREDENTIALS ===');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('\nYou can now login with these credentials!');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createSimpleAdmin();
