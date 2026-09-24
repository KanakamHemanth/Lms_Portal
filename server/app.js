const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const dns = require("dns");
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Ignore if not supported in node version
}

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const courseRoute = require("./routes/courseRoutes");
const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "CourseCraft LMS API is running" });
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/courses", courseRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
