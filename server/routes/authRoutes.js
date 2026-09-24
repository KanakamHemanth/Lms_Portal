const express = require("express")
const { login, register, getMe, updateMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const authRoute = express.Router();

authRoute.post("/login", login);
authRoute.post("/register", register);
authRoute.get("/me", protect, getMe);
authRoute.put("/me", protect, updateMe);

module.exports = authRoute;