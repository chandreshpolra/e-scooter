# E-Scooter Blog

A modern, responsive blog platform focused on electric scooters and electric vehicles. Built with Node.js, Express, MongoDB, and EJS.

## Features

### Public Features
- **Responsive Design**: Mobile-friendly blog layout
- **Blog Listing**: Display all published blogs with pagination
- **Blog Detail Pages**: Individual blog posts with related content
- **SEO Optimized**: Meta tags, structured data, and sitemap
- **Search & Filter**: Find blogs by category and status
- **Related Posts**: Show related blog posts on detail pages

### Admin Features
- **Secure Admin Panel**: Protected admin dashboard
- **Blog Management**: Create, edit, delete, and manage blog posts
- **Rich Text Editor**: Quill.js integration for content editing
- **Image Upload**: Featured image support with preview
- **SEO Tools**: Meta title, description, and tags management
- **Bulk Operations**: Select multiple blogs for bulk actions
- **Status Management**: Toggle blog active/inactive status
- **Search & Filtering**: Advanced search and filtering options
- **Pagination**: Efficient blog listing with pagination
- **Auto-save**: Draft auto-save functionality

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Template Engine**: EJS
- **Frontend**: Bootstrap 5, Custom CSS
- **Rich Text Editor**: Quill.js
- **File Upload**: Express-fileupload
- **Authentication**: Express-session, bcryptjs
- **Styling**: Bootstrap Icons, Font Awesome

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-scooter.blog-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=3002
   MONGODB_URI=mongodb://localhost:27017/e-scooter.blog-blog
   SESSION_SECRET=your-secret-key-here
   ADMIN_PATH=secure_dashboard_85490gtu4rgj
   NODE_ENV=development
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - The application will automatically create collections

5. **Create Admin User**
   ```bash
   npm run seed
   ```
   This will create a default admin user:
   - Email: admin@escooter.com
   - Password: admin123

6. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Project Structure

```
e-scooter.blog/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication controller
│   └── blogController.js    # Blog management controller
├── middleware/
│   └── authMiddleware.js    # Authentication middleware
├── models/
│   ├── Admin.js            # Admin user model
│   └── Blog.js             # Blog post model
├── public/
│   ├── css/
│   │   ├── admin.css       # Admin styles
│   │   └── style.css       # Public styles
│   ├── images/             # Static images
│   ├── js/
│   │   ├── admin.js        # Admin JavaScript
│   │   └── user.js         # Public JavaScript
│   └── uploads/
│       └── blogs/          # Blog image uploads
├── routes/
│   ├── blogRoutes.js       # Blog routes
│   └── indexRoute.js       # Main routes
├── scripts/
│   ├── createAdmin.js      # Admin user creation
│   └── seedDatabase.js     # Database seeding
├── views/
│   ├── Admin/
│   │   ├── dashboard.ejs   # Admin dashboard
│   │   ├── blogs.ejs       # Blog management
│   │   └── blog-form.ejs   # Blog creation/editing
│   ├── partials/
│   │   ├── admin-navbar.ejs # Admin navigation
│   │   ├── footer.ejs      # Footer component
│   │   └── navbar.ejs      # Public navigation
│   ├── blog-detail.ejs     # Individual blog page
│   ├── index.ejs           # Homepage
│   └── sitemap.ejs         # Sitemap page
├── index.js                # Main application file
└── package.json
```

## Usage

### Public Access
- Visit `http://localhost:3002` to view the public blog
- Browse blog posts, read articles, and explore categories

### Admin Access
- Visit `http://localhost:3002/secure_dashboard_85490gtu4rgj`
- Login with admin credentials
- Manage blogs, create new posts, and configure settings

### Blog Management
1. **Create New Blog**
   - Click "Create New Blog" in admin panel
   - Fill in title, excerpt, and content
   - Upload featured image
   - Set SEO meta tags
   - Save and publish

2. **Edit Blog**
   - Select blog from admin list
   - Modify content using rich text editor
   - Update SEO settings
   - Save changes

3. **Bulk Operations**
   - Select multiple blogs using checkboxes
   - Perform bulk actions: activate, deactivate, or delete

## API Endpoints

### Public API
- `GET /api/blogs` - Get all active blogs
- `GET /blogs/:slug` - Get specific blog by slug

### Admin API
- `GET /admin/blogs` - Get all blogs (admin)
- `POST /admin/blogs/create` - Create new blog
- `POST /admin/blogs/:id/edit` - Update blog
- `POST /admin/blogs/:id/delete` - Delete blog
- `POST /admin/blogs/:id/toggle-status` - Toggle blog status
- `POST /admin/blogs/bulk-delete` - Bulk delete blogs
- `POST /admin/blogs/bulk-update-status` - Bulk update status

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3002)
- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Session encryption key
- `ADMIN_PATH`: Admin panel URL path
- `NODE_ENV`: Environment mode

### Customization
- **Categories**: Add new blog categories in `views/Admin/blog-form.ejs`
- **Styling**: Modify CSS files in `public/css/`
- **Admin Path**: Change `ADMIN_PATH` in `.env` for security

## Security Features

- **Session-based Authentication**: Secure admin login
- **Password Hashing**: bcryptjs for password security
- **File Upload Validation**: Image type and size restrictions
- **CSRF Protection**: Form validation and security
- **Input Sanitization**: XSS prevention

## Performance Features

- **Pagination**: Efficient blog listing
- **Image Optimization**: Automatic image resizing
- **Caching**: Static file caching
- **Database Indexing**: Optimized queries

## Deployment

### Production Setup
1. Set `NODE_ENV=production` in `.env`
2. Configure production MongoDB URI
3. Set secure `SESSION_SECRET`
4. Use PM2 or similar process manager
5. Configure reverse proxy (nginx)

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0
- Initial release
- Blog management system
- Admin panel
- Rich text editor
- SEO optimization
- Responsive design


