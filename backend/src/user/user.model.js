import {model,Schema} from "mongoose";

const userSchema = new Schema({
    fullname : {
        type : String,
        required : true,
        lowercase : true,
        trim : true,
    },
    mobile : {
        type : String,
        required : true,
        trim : true,
    },
    email : {
        type : String,
        required : true,
        trim : true,
        unique : true,
    },
    password: {
        type : String,
        required : true,
        trim : true,
    },
    status : {
        type : Boolean,
        default : false,
    },
    role : {
        type : String,
        default : "user",
        enum : ['user']
    },
    monthlyBudget : {
        type : Number,
        default : 0
    }
},{timestamps:true});

const UserModel = model('User',userSchema);
export default UserModel;