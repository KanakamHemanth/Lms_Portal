const UserModel = require("../models/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Invalid Input: Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (!existingUser) {
      return res.status(400).json({
        message: "Email Is Not Registered, Please Register",
      });
    }

    const checkPassword = await bcrypt.compare(password, existingUser.password);

    if (!checkPassword) {
      return res.status(400).json({
        message: "Wrong Password",
      });
    }

    const token = jwt.sign({ id: existingUser._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login Successfully",
      token: token,
      Token: token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Invalid Input: All fields (name, email, password, role) are required",
      });
    }

    const validRoles = ["admin", "instructor", "student"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Allowed roles are: ${validRoles.join(", ")}`,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const encryptPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: encryptPassword,
      role: role,
    });

    return res.status(201).json({
      message: "User Registered Successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
}

async function getMe(req, res) {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve profile",
      error: error.message,
    });
  }
}

async function updateMe(req, res) {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, password } = req.body;
    if (name) user.name = name.trim();
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
}

module.exports = {
  login,
  register,
  getMe,
  updateMe,
};