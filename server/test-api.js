require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");
const courseRoute = require("./routes/courseRoutes");

// Build test express app
const testApp = express();
testApp.use(express.json());
testApp.use(cors());

testApp.get("/", (req, res) => {
  res.json({ message: "CourseCraft LMS API is running" });
});

testApp.use("/api/auth", authRoute);
testApp.use("/api/users", userRoute);
testApp.use("/api/courses", courseRoute);

async function runTests() {
  await connectDB();

  const server = testApp.listen(3002);
  const BASE_URL = "http://localhost:3002";

  async function api(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const status = res.status;
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status, data, ok: res.ok };
  }

  console.log("\n=================================================================");
  console.log("   COURSE CRAFT LMS: COMPLETE POSTMAN & REST API TEST SUITE     ");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extra = "") {
    if (condition) {
      console.log(`  [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${title} - ${extra}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // SECTION 1: HEALTH & AUTHENTICATION
    // -------------------------------------------------------------
    console.log("--- 1. HEALTH CHECK ---");
    const health = await api("/");
    assert("GET / returns 200 OK", health.status === 200);

    console.log("\n--- 2. AUTHENTICATION & USER/INSTRUCTOR REGISTRATION ---");
    const timestamp = Date.now();
    const instructorEmail = `postman.instructor.${timestamp}@example.com`;
    const studentEmail = `postman.student.${timestamp}@example.com`;

    // 2.1 Register Instructor
    const regInstructor = await api("/api/auth/register", {
      method: "POST",
      body: {
        name: "Postman Instructor",
        email: instructorEmail,
        password: "Password123",
        role: "instructor",
      },
    });
    assert("POST /api/auth/register (Instructor) returns 201 Created", regInstructor.status === 201);
    assert("Instructor registration returns role 'instructor'", regInstructor.data?.user?.role === "instructor");
    const instructorId = regInstructor.data?.user?.id || regInstructor.data?.user?._id;

    // 2.2 Register Student
    const regStudent = await api("/api/auth/register", {
      method: "POST",
      body: {
        name: "Postman Student",
        email: studentEmail,
        password: "Password123",
        role: "student",
      },
    });
    assert("POST /api/auth/register (Student) returns 201 Created", regStudent.status === 201);

    // 2.3 Login Instructor
    const loginInstructor = await api("/api/auth/login", {
      method: "POST",
      body: { email: instructorEmail, password: "Password123" },
    });
    assert("POST /api/auth/login (Instructor) returns 200 OK", loginInstructor.status === 200);
    const instructorToken = loginInstructor.data?.token || loginInstructor.data?.Token;
    assert("Instructor JWT token received", !!instructorToken);

    // 2.4 Login Student
    const loginStudent = await api("/api/auth/login", {
      method: "POST",
      body: { email: studentEmail, password: "Password123" },
    });
    assert("POST /api/auth/login (Student) returns 200 OK", loginStudent.status === 200);
    const studentToken = loginStudent.data?.token;

    // 2.5 Auth /me Profile GET
    const profileRes = await api("/api/auth/me", {
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert("GET /api/auth/me returns 200 with current profile", profileRes.status === 200 && profileRes.data?.user?.email === instructorEmail);

    // 2.6 Auth /me Profile PUT
    const updateProfileRes = await api("/api/auth/me", {
      method: "PUT",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: { name: "Postman Master Instructor" },
    });
    assert("PUT /api/auth/me updates current user profile name", updateProfileRes.status === 200 && updateProfileRes.data?.user?.name === "Postman Master Instructor");

    // -------------------------------------------------------------
    // SECTION 2: USERS & INSTRUCTORS MANAGEMENT (CRUD)
    // -------------------------------------------------------------
    console.log("\n--- 3. USERS & INSTRUCTORS MANAGEMENT CRUD ---");

    // 3.1 Create / Add User or Instructor via /api/users
    const createdInstructorEmail = `direct.instructor.${timestamp}@example.com`;
    const createDirectUser = await api("/api/users", {
      method: "POST",
      body: {
        name: "Direct API Instructor",
        email: createdInstructorEmail,
        password: "Password123",
        role: "instructor",
      },
    });
    assert("POST /api/users (Add Instructor) returns 201 Created", createDirectUser.status === 201);
    const directUserId = createDirectUser.data?.user?.id || createDirectUser.data?.user?._id;
    assert("Added user returned valid _id", !!directUserId);

    // 3.2 GET All Users
    const getAllUsers = await api("/api/users");
    assert("GET /api/users returns 200 OK with list of users", getAllUsers.status === 200 && Array.isArray(getAllUsers.data));

    // 3.3 GET Users filtered by ?role=instructor
    const getInstructors = await api("/api/users?role=instructor");
    assert("GET /api/users?role=instructor returns only instructors", getInstructors.status === 200 && getInstructors.data.every(u => u.role === "instructor"));

    // 3.4 GET Single User by ID
    const getUser = await api(`/api/users/${directUserId}`);
    assert("GET /api/users/:id returns 200 with matching user", getUser.status === 200 && (getUser.data?._id === directUserId || getUser.data?.id === directUserId));

    // 3.5 Login as Newly Created User to obtain their own token
    const directUserLogin = await api("/api/auth/login", {
      method: "POST",
      body: { email: createdInstructorEmail, password: "Password123" },
    });
    assert("Login as created user returns 200 OK", directUserLogin.status === 200);
    const directUserToken = directUserLogin.data?.token;

    // 3.6 Non-admin cannot update another user's profile (403 Forbidden)
    const unauthorizedUserUpdate = await api(`/api/users/${directUserId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: { name: "Malicious Update Attempt" },
    });
    assert("PUT /api/users/:id by different non-admin returns 403 Forbidden", unauthorizedUserUpdate.status === 403);

    // 3.7 UPDATE User by ID (Self Update with User's own Token)
    const updateUserRes = await api(`/api/users/${directUserId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${directUserToken}` },
      body: { name: "Updated Direct API Instructor" },
    });
    assert("PUT /api/users/:id updates user details with user's own token", updateUserRes.status === 200);
    assert("User name updated properly", updateUserRes.data?.user?.name === "Updated Direct API Instructor");

    // 3.8 DELETE User by ID (Self Delete with User's own Token)
    const deleteUserRes = await api(`/api/users/${directUserId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${directUserToken}` },
    });
    assert("DELETE /api/users/:id deletes user successfully", deleteUserRes.status === 200);

    // 3.9 Verify User is Deleted (404)
    const verifyUserDeleted = await api(`/api/users/${directUserId}`);
    assert("GET /api/users/:id on deleted user returns 404 Not Found", verifyUserDeleted.status === 404);


    // -------------------------------------------------------------
    // SECTION 3: COURSES CRUD OPERATIONS
    // -------------------------------------------------------------
    console.log("\n--- 4. COURSES CRUD OPERATIONS ---");

    // 4.1 GET All Courses
    const getCoursesRes = await api("/api/courses");
    assert("GET /api/courses returns 200 OK", getCoursesRes.status === 200 && Array.isArray(getCoursesRes.data));

    // 4.2 CREATE Course (POST)
    const newCourseTitle = `Full Stack MERN Mastery ${timestamp}`;
    const createCourseRes = await api("/api/courses", {
      method: "POST",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: {
        title: newCourseTitle,
        description: "Master React, Node, Express, and MongoDB with hands-on projects.",
        category: "Web Development",
        level: "Intermediate",
        price: 49.99,
        duration: 25,
      },
    });
    assert("POST /api/courses (Create Course) returns 201 Created", createCourseRes.status === 201);
    const createdCourseId = createCourseRes.data?.course?._id;
    assert("Created course has valid _id", !!createdCourseId);

    // 4.3 GET Course by ID
    const getCourseByIdRes = await api(`/api/courses/${createdCourseId}`);
    assert("GET /api/courses/:id returns 200 with matching course", getCourseByIdRes.status === 200 && getCourseByIdRes.data?._id === createdCourseId);
    assert("Course populates instructor name", typeof getCourseByIdRes.data?.instructor?.name === "string");

    // 4.4 UPDATE Course (PUT)
    const updateCourseRes = await api(`/api/courses/${createdCourseId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${instructorToken}` },
      body: {
        price: 59.99,
        level: "All Levels",
      },
    });
    assert("PUT /api/courses/:id (Update Course) returns 200 OK", updateCourseRes.status === 200);
    assert("Updated course price reflects new value (59.99)", updateCourseRes.data?.course?.price === 59.99);

    // 4.5 DELETE Course (DELETE)
    const deleteCourseRes = await api(`/api/courses/${createdCourseId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert("DELETE /api/courses/:id (Delete Course) returns 200 OK", deleteCourseRes.status === 200);

    // 4.6 Verify Course is Deleted (404)
    const verifyCourseDeleted = await api(`/api/courses/${createdCourseId}`);
    assert("GET /api/courses/:id on deleted course returns 404 Not Found", verifyCourseDeleted.status === 404);

    // -------------------------------------------------------------
    // SECTION 4: SECURITY & AUTHORIZATION VERIFICATION
    // -------------------------------------------------------------
    console.log("\n--- 5. AUTHORIZATION & ROLE RESTRICTIONS ---");

    // 5.1 Unauthorized Create Course (No token)
    const unauthCreate = await api("/api/courses", {
      method: "POST",
      body: {
        title: "Unauthorized Course Attempt",
        description: "Should fail with 401",
        category: "Test",
        level: "Beginner",
        price: 10,
        duration: 5,
      },
    });
    assert("POST /api/courses without Token returns 401 Unauthorized", unauthCreate.status === 401);

    // 5.2 Forbidden Create Course (Student token)
    const forbiddenCreate = await api("/api/courses", {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: "Student Attempting to Create Course",
        description: "Should fail with 403",
        category: "Test",
        level: "Beginner",
        price: 10,
        duration: 5,
      },
    });
    assert("POST /api/courses by Student returns 403 Forbidden", forbiddenCreate.status === 403);

    console.log("\n=================================================================");
    console.log(`   TEST SUMMARY: ${passed} PASSED, ${failed} FAILED               `);
    console.log("=================================================================\n");

    server.close();
    await mongoose.disconnect();
    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error("Test execution error:", err);
    server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests();
