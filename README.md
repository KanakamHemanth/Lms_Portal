# CourseCraft - LMS Portal

A full-stack Learning Management System (LMS) web application built with the MERN stack (MongoDB, Express, React, Node.js). 

Developed by **Kanakam Hemanth**.

---

## 🚀 Features

- **Authentication & Authorization**: Secure JWT-based authentication with role-based access control (`student`, `instructor`, `admin`).
- **User & Instructor Management**: Full CRUD operations for managing user and instructor profiles.
- **Course Management**:
  - Browse available courses with details, price, category, and instructor info.
  - Instructors & Admins can Create, Read, Update, and Delete courses.
- **Interactive API Testing**: Includes a pre-configured Postman Collection with automated variable handling.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs

---

## 📁 Project Structure

```text
lms-portal/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/     # UI Components (Navbar, CourseCard, AuthForm, etc.)
│   │   ├── pages/          # Pages (HomePage, CoursesPage, CourseDetailPage, etc.)
│   │   └── services/       # API integration service
├── server/                 # Node.js & Express REST API Backend
│   ├── config/             # Database connection setup
│   ├── controllers/        # Controller logic (auth, user, course)
│   ├── middleware/         # Auth & authorization middleware
│   ├── models/             # Mongoose schemas (User, Course)
│   ├── routes/             # API routes
│   └── CourseCraft_LMS_Postman_Collection.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas connection string

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KanakamHemanth/Lms_Portal.git
   cd Lms_Portal
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory using `.env.example`:
   ```env
   PORT=3000
   MONGO_URL=your_mongodb_connection_string
   SECRET_KEY=your_jwt_secret_key
   ```
   Start the backend server:
   ```bash
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 📬 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user / instructor
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get logged-in user profile
- `PUT /api/auth/me` - Update logged-in profile

### Users & Instructors
- `GET /api/users` - Get all users
- `GET /api/users?role=instructor` - Get all instructors
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Add new user/instructor
- `PUT /api/users/:id` - Update user details
- `DELETE /api/users/:id` - Delete user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (Instructor/Admin)
- `PUT /api/courses/:id` - Update course (Instructor/Admin)
- `DELETE /api/courses/:id` - Delete course (Instructor/Admin)

---

## 👤 Author

Developed by **Kanakam Hemanth**
