const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// Get all users with optional role filtering
async function getUsers(req, res) {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role.toLowerCase().trim();
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve users",
      error: error.message,
    });
  }
}

// Get user by ID
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve user",
      error: error.message,
    });
  }
}

// Create new user or instructor
async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Invalid Input: All fields (name, email, password, role) are required",
      });
    }

    const validRoles = ["admin", "instructor", "student"];
    const normalizedRole = role.toLowerCase().trim();
    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({
        message: `Invalid role. Allowed roles are: ${validRoles.join(", ")}`,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to create user",
      error: error.message,
    });
  }
}

// Update user details
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user && req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({
        message: "You do not have permission to update this user",
      });
    }

    const { name, email, password, role } = req.body;

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailTaken) {
        return res.status(400).json({ message: "Email is already in use by another account" });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) {
      user.name = name.trim();
    }

    if (role) {
      const validRoles = ["admin", "instructor", "student"];
      const normalizedRole = role.toLowerCase().trim();
      if (!validRoles.includes(normalizedRole)) {
        return res.status(400).json({
          message: `Invalid role. Allowed roles are: ${validRoles.join(", ")}`,
        });
      }
      user.role = normalizedRole;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to update user",
      error: error.message,
    });
  }
}

// Delete user
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user && req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({
        message: "You do not have permission to delete this user",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to delete user",
      error: error.message,
    });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
