import mongoose, { Schema, Types, model } from "mongoose";

const couponSchema = new Schema({
    name: {
        type: String,
        unique: [true, 'name must be unique'],
        required: [true, 'name is required'],
        trim: true,
        lowercase: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    image: {
        type: Object,
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: [false, 'userId is required']   //replace to true
    },
    usedBy: [{
        type: Types.ObjectId,
        ref: 'User',
    }],
    expireIn: {
        type: Date,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
})



const couponModel = mongoose.model.Coupon || model('Coupon', couponSchema)

export default couponModel