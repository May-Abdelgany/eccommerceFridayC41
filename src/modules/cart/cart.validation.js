import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const tokenSchema = joi.object({
    authorization: joi.string().required()
}).required()

export const addToCartSchema = joi.object({
    productId: generalFields.id,
    quantity: joi.number().positive().integer().min(1).required()
}).required()

export const removeFromCartSchema = joi.object({
    productId: generalFields.id,
}).required()