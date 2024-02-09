import mongoose, { Schema, Types, model } from "mongoose";

const orderSchema = new Schema({
    products: [
        {
            productId: {
                type: Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            name: {
                type: String,
                required: [true, 'name is required'],
            },
            unitPrice: {
                type: Number,
                required: true,
                min: 1
            },
            finalPrice: {
                type: Number,
                required: true,
                min: 1
            },
        }
    ],
    address: {
        type: String,
        required: true
    },
    phone: [
        {
            type: String,
            required: true
        }
    ],
    note: String,
    reason: String,
    paymentType: {
        type: String,
        enum: ['card', 'cash'],
        default: 'cash'
    },
    status: {
        type: String,
        enum: ['placed', 'waitForPayment', 'canceld', 'onWay', 'rejected', 'deliverd'],
        default: 'placed'
    },
    couponId: {
        type: Types.ObjectId,
        ref: 'Coupon'
    },
    subPrice: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 1
    },
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true,
})



const orderModel = mongoose.model.Order || model('Order', orderSchema)

export default orderModel