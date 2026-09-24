require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Course = require("./models/course");

async function seedData() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB successfully.");

    const hashedPassword = await bcrypt.hash("Password123", 10);

    // 1. Seed or update Instructor
    let instructor = await User.findOne({ email: "alex@example.com" });
    if (!instructor) {
      instructor = await User.create({
        name: "Alex Morgan",
        email: "alex@example.com",
        password: hashedPassword,
        role: "instructor",
      });
      console.log("Created instructor user: alex@example.com");
    } else {
      instructor.password = hashedPassword;
      instructor.role = "instructor";
      instructor.name = "Alex Morgan";
      await instructor.save();
      console.log("Updated instructor user: alex@example.com with password 'Password123'");
    }

    // 2. Seed Admin
    let admin = await User.findOne({ email: "admin@example.com" });
    if (!admin) {
      admin = await User.create({
        name: "System Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Created admin user: admin@example.com");
    }

    // 3. Seed Student
    let student = await User.findOne({ email: "student@example.com" });
    if (!student) {
      student = await User.create({
        name: "Jane Doe",
        email: "student@example.com",
        password: hashedPassword,
        role: "student",
      });
      console.log("Created student user: student@example.com");
    }

    // 4. Sample Courses
    const sampleCourses = [
      {
        title: "Full-Stack MERN Development",
        description:
          "Build full-scale, production-ready web applications from scratch with MongoDB, Express, React, and Node.js.",
        instructor: instructor._id,
        category: "Web Development",
        level: "Intermediate",
        price: 49,
        duration: 40,
      },
      {
        title: "Modern React & State Management",
        description:
          "Master modern React 19, hooks, component composition, Context API, and state patterns for snappy user interfaces.",
        instructor: instructor._id,
        category: "Frontend",
        level: "Beginner",
        price: 29,
        duration: 25,
      },
      {
        title: "Node.js RESTful API & Microservices",
        description:
          "Architect robust, secure REST APIs with Express, JWT authentication, role-based authorization, and MongoDB Atlas.",
        instructor: instructor._id,
        category: "Backend",
        level: "Advanced",
        price: 39,
        duration: 30,
      },
      {
        title: "Python for Data Science & AI Foundations",
        description:
          "Kickstart your career in Data Science and Machine Learning with Python, NumPy, Pandas, and exploratory data analysis.",
        instructor: instructor._id,
        category: "Data Science",
        level: "Beginner",
        price: 0,
        duration: 20,
      },
      {
        title: "UI/UX Design Systems with Figma",
        description:
          "Craft beautiful, accessible design tokens, typography scales, wireframes, and scalable design components.",
        instructor: instructor._id,
        category: "Design",
        level: "Intermediate",
        price: 19,
        duration: 15,
      },
      {
        title: "DevOps, Docker & Cloud Deployment",
        description:
          "Learn containerization, automated CI/CD workflows, Docker orchestration, and zero-downtime cloud deployments.",
        instructor: instructor._id,
        category: "DevOps",
        level: "Intermediate",
        price: 59,
        duration: 35,
      },
    ];

    let insertedCount = 0;
    for (const courseData of sampleCourses) {
      const exists = await Course.findOne({ title: courseData.title });
      if (!exists) {
        await Course.create(courseData);
        insertedCount++;
        console.log(`Inserted course: "${courseData.title}"`);
      } else {
        console.log(`Course already exists: "${courseData.title}"`);
      }
    }

    const totalCourses = await Course.countDocuments();
    const totalUsers = await User.countDocuments();

    console.log("\n================ SEED SUMMARY ================");
    console.log(`Total Users in DB: ${totalUsers}`);
    console.log(`Total Courses in DB: ${totalCourses}`);
    console.log(`New Courses Inserted: ${insertedCount}`);
    console.log("Default credentials:");
    console.log("  Instructor: alex@example.com / Password123");
    console.log("  Admin:      admin@example.com / Password123");
    console.log("  Student:    student@example.com / Password123");
    console.log("==============================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedData();
