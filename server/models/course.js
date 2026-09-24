const mongoose = require("mongoose")
const courseSchema = new mongoose.Schema({
    title:{
        type: String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    instructor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users",
        required : true
    },
    category : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    level : {
        type : String,
        required: true
    },
    duration : {
        type : Number,
        required : true
    }
},
{
    timestamps : true
})
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)

module.exports = Course