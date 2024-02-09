import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const tokenSchema = joi.object({
    authorization: joi.string().required()
}).required()

export const createOrderSchema = joi.object({
    address: joi.string().min(10).max(100).required(),
    phone: joi.array().items(joi.string().required()).required(),
    note: joi.string().min(5).max(200),
    paymentType: joi.string().valid('card', 'cash'),
    couponName: joi.string().min(3).max(25).trim(),
    products: joi.array().items(joi.object({
        productId: generalFields.id,
        quantity: joi.number().positive().integer().min(1).required()
    }).required())

}).required()

export const cancelOrder = joi.object({
    orderId: generalFields.id
}).required()
