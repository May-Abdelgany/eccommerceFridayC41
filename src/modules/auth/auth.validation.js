import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const signUpSchema = joi.object({
    userName: joi.string().min(2).max(20).required(),
    email: generalFields.email,
    password: generalFields.password,
    cPassword: joi.string().valid(joi.ref('password')).required(),
    role: joi.string().valid('User', 'Admin')
}).required()


export const loginSchema = joi.object({
    email: generalFields.email,
    password: generalFields.password,
}).required()


export const tokenSchema = joi.object({
    token: joi.string().required()
}).required()

export const sendCodeSchema = joi.object({
    email: generalFields.email,

}).required()


export const fogetPasswordSchema = joi.object({
    email: generalFields.email,
    password: generalFields.password,
    cPassword: joi.string().valid(joi.ref('password')).required(),
    code: joi.string().pattern(new RegExp(/^\d{5}$/)).required()
}).required()