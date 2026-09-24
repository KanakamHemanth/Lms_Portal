const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const userRoutes = express.Router();

userRoutes.get("/", getUsers);
userRoutes.get("/:id", getUserById);
userRoutes.post("/", createUser);
userRoutes.put("/:id", protect, updateUser);
userRoutes.delete("/:id", protect, deleteUser);

module.exports = userRoutes;
