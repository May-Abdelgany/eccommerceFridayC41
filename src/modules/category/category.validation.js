import joi from "joi"
import { generalFields } from "../../utils/generalFields.js"
export const oneCategorySchema = joi.object({
    categoryId: generalFields.id
}).required()

export const tokenSchema = joi.object({
    authorization: joi.string().required()
}).required()

export const createCategorySchema = joi.object({
    name: joi.string().min(3).max(25).trim().required(),
    file: generalFields.file.required()
}).required()


export const updateCategorySchema = joi.object({
    name: joi.string().min(3).max(25).trim(),
    file: generalFields.file,
    categoryId: generalFields.id
}).required()

