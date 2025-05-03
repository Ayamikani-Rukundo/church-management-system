
# Campus Church Connect Web Application

A full-stack web application for an Adventist church on campus. The application includes a beautiful frontend built with React and Tailwind CSS, and a backend powered by Node.js, Express, and MongoDB.

## Features

- **Gallery Page:** Admin can upload photos with descriptions
- **Leaders Page:** Display church leaders with profile pictures and bios
- **Announcements Page:** Keep the congregation updated with the latest news
- **About Page:** Information about the church
- **Resources Page:** Access to books and Bible verses
- **Admin Dashboard:** Secure login for content management

## Technologies Used

### Frontend
- React
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- React Router
- Axios
- React Query

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Frontend Setup
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup
1. Navigate to the server directory:
   ```
   cd server
   ```
2. Install server dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the server directory based on `.env.example`
4. Start the server:
   ```
   npm run dev
   ```

### Environment Variables
Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

### Initial Admin Setup
To create the initial admin user, send a POST request to `/api/auth/setup` with the following JSON body:
```json
{
  "username": "admin",
  "password": "your_secure_password"
}
```

You can use tools like Postman or cURL to make this request.

## Project Structure

```
project-root/
├── public/              # Static files
├── src/                 # React frontend code
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   │   └── admin/       # Admin pages
│   ├── App.tsx          # Main App component with routes
│   └── main.tsx         # Entry point
├── server/              # Node.js backend code
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded files (created at runtime)
│   └── index.js         # Server entry point
└── README.md            # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/setup` - Create initial admin (one-time use)
- `GET /api/auth/user` - Get current user info

### Gallery
- `GET /api/gallery` - Get all gallery items
- `GET /api/gallery/:id` - Get specific gallery item
- `POST /api/gallery` - Create gallery item (admin only)
- `PUT /api/gallery/:id` - Update gallery item (admin only)
- `DELETE /api/gallery/:id` - Delete gallery item (admin only)

### Leaders
- `GET /api/leaders` - Get all leaders
- `GET /api/leaders/:id` - Get specific leader
- `POST /api/leaders` - Create leader (admin only)
- `PUT /api/leaders/:id` - Update leader (admin only)
- `DELETE /api/leaders/:id` - Delete leader (admin only)

### Announcements
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get specific announcement
- `POST /api/announcements` - Create announcement (admin only)
- `PUT /api/announcements/:id` - Update announcement (admin only)
- `DELETE /api/announcements/:id` - Delete announcement (admin only)

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get specific book
- `POST /api/books` - Create book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### Bible Verses
- `GET /api/verses` - Get all verses
- `GET /api/verses/:id` - Get specific verse
- `POST /api/verses` - Create verse (admin only)
- `PUT /api/verses/:id` - Update verse (admin only)
- `DELETE /api/verses/:id` - Delete verse (admin only)

### File Upload
- `POST /api/upload` - Upload a file (admin only)

## License

This project is licensed under the MIT License.
