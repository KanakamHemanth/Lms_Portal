require("dotenv").config()
const express = require("express")
const connectDB = require("./config/db")
const dns = require("dns")
const courseRoute = require("./routes/courseRoutes")
const authRoute = require("./routes/authRoutes")
const userRoute = require("./routes/userRoutes")
const app = express()
const cors = require("cors")

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
  res.json({ message: "CourseCraft LMS API is running" })
})

app.use("/api/auth", authRoute)
app.use("/api/users", userRoute)
app.use("/api/courses", courseRoute)


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

connectDB()
