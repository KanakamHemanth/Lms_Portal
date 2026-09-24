const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        required : true,
        enum : {
            values : ["admin","instructor","student"]
        }
    },
},
{
    timestamps : true
})
const UserModel = mongoose.models.Users || mongoose.model("Users", userSchema)

module.exports = UserModel