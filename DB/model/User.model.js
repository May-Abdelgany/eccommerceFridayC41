import mongoose, { Schema, model } from "mongoose";


const userSchema = new Schema({
    userName: {
        type: String,
        required: [true, 'userName is required'],
        min: [2, 'minimum length 2 char'],
        max: [20, 'max length 2 char']
    },
    email: {
        type: String,
        unique: [true, 'email must be unique value'],
        required: [true, 'userName is required'],
    },
    password: {
        type: String,
        required: [true, 'password is required'],
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        default: 'Admin',
        enum: ['User', 'Admin']
    },
    confirmEmail: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        default: 'Offline',
        enum: ['Offline', 'Online']
    },
    gender: {
        type: String,
        default: 'Female',
        enum: ['Male', 'Female']
    },
    address: String,
    image: String,
    DOB: String,
    code: String
    // wishList:[]
}, {
    timestamps: true
})


const userModel = mongoose.model.User || model('User', userSchema)
export default userModel