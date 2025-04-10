# Volunteer Connect Platform

Volunteer Connect is a full-stack web application that connects volunteers with opportunities to make a positive impact in their communities. The platform allows organizations to post volunteer events and users to browse, join and manage their participation in these events.

## 🌟 Features

- User authentication (registration, login, session management)
- Event browsing and filtering
- Event planning and management
- Photo gallery for event memories
- Statistics dashboard
- Mobile-responsive design
- Admin dashboard for managing users and events

## 🔧 Technology Stack

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5
- Responsive design

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- Authentication with sessions
- RESTful API architecture

### Deployment
- Frontend: GitHub Pages / Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📁 Project Structure

The project is organized into two main parts:

### Frontend (`assignment1.github.io-main/`)
```
assignment1.github.io-main/
├── css/                # Styling
├── js/                 # Client-side JavaScript
│   ├── api.js          # API client for backend communication
│   └── header.js       # Manages the header/navigation
├── images/             # Image assets
├── *.html              # HTML pages
└── README.md           # Frontend documentation
```

### Backend (`src/`)
```
src/
├── config/             # Configuration files
│   └── database.js     # MongoDB connection setup
├── controllers/        # Request handlers
│   ├── authController.js  # Authentication logic
│   ├── eventController.js # Event management logic
│   └── galleryController.js # Gallery operations
├── middleware/         # Custom middleware
│   └── auth.js         # Authentication middleware
├── models/             # Database models
│   ├── User.js         # User schema
│   ├── Event.js        # Event schema
│   └── Gallery.js      # Gallery schema
├── routes/             # API routes
│   ├── authRoutes.js   # Authentication endpoints
│   ├── eventRoutes.js  # Event endpoints
│   └── galleryRoutes.js # Gallery endpoints
├── public/             # Static files (frontend)
└── server.js           # Main application file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or newer)
- MongoDB (local or Atlas)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sakshamv259/assignment1.github.io.git
   cd assignment1.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```
   NODE_ENV=development
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/volunteer-connect
   SESSION_SECRET=your_secret_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open `http://localhost:8080` in your browser

## 🔄 Making Updates

### Updating Content

#### Modifying Text Content
1. Locate the relevant HTML file in the project
2. Edit the text content directly in the HTML file
3. Save and commit your changes

#### Updating Images
1. Add new images to the `images/` directory
2. To replace an existing image, replace the file with the same name
3. To add a new image reference, update the relevant HTML or CSS files

### Adding New Events or Gallery Items

#### Adding Events
1. Use the built-in admin interface after logging in with admin credentials
2. Or add directly to the database using the Event schema

#### Adding Gallery Images
1. Upload images to the `images/gallery/` directory
2. Update the gallery data file at `src/public/data/gallery.json`

### Updating Styles
1. Modify the CSS files in the `css/` directory
2. For component-specific styling, find the relevant section in style.css

### Backend Changes
1. Modify controllers, models or routes in the `src/` directory
2. Test changes locally before deploying
3. Update corresponding frontend API calls if needed

## 🔐 Authentication

User authentication is session-based using HTTP-only cookies. The auth flow is:
1. User logs in with username/password
2. Server validates credentials and sets a session cookie
3. Future requests include this cookie for authentication

Admin accounts have additional privileges for managing content.

## 📱 API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify authentication status
- `GET /api/auth/me` - Get current user information

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event (auth required)
- `GET /api/events/:id` - Get a specific event
- `PUT /api/events/:id` - Update an event (auth required)
- `DELETE /api/events/:id` - Delete an event (admin only)
- `POST /api/events/:id/join` - Join an event (auth required)
- `POST /api/events/:id/leave` - Leave an event (auth required)

### Gallery
- `GET /api/gallery` - Get all gallery items
- `POST /api/gallery` - Add new gallery item (admin only)
- `DELETE /api/gallery/:id` - Delete gallery item (admin only)

## 📋 Environment Variables

Key environment variables for configuration:

- `NODE_ENV` - Environment mode (development, production)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Secret for session encryption

## 🚢 Deployment

### Deploying Updates

1. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

2. **Frontend deployment**
   The frontend is automatically deployed to GitHub Pages or Vercel when changes are pushed to the main branch.

3. **Backend deployment**
   The backend is deployed to Render and automatically updates when changes are pushed to GitHub.

### Monitoring

- Backend logs are available in the Render dashboard
- MongoDB logs and metrics are available in MongoDB Atlas

## 🔍 Troubleshooting

### Common Issues

1. **API returns 500 errors**
   - Check MongoDB connection string
   - Verify environment variables are set correctly
   - Check server logs for detailed error messages

2. **Authentication issues**
   - Clear browser cookies and try again
   - Check CORS configuration in server.js
   - Verify user data in the database

3. **Images not loading**
   - Check file paths and case sensitivity
   - Verify image files exist in the correct directory
   - Check network tab in browser developer tools

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Contact

For questions or support, contact the project maintainer at [your-email@example.com].