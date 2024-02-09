import joi from 'joi'
import { generalFields } from '../../utils/generalFields.js'
export const tokenSchema = joi.object({
    authorization: joi.string().required()
}).required()

export const createProductSchema = joi.object({
    name: joi.string().min(3).max(30).required(),
    categoryId: generalFields.id,
    subCategoryId: generalFields.id,
    brandId: generalFields.id,
    price: joi.number().min(1).positive().required(),
    discount: joi.number().min(1).max(100).positive(),
    stock: joi.number().positive().integer().min(1).required(),
    files: joi.object({
        //mainImage:[{}]
        mainImage: joi.array().items(generalFields.file.required()).required(),
        subImages: joi.array().items(generalFields.file)
    }).required(),
    description: joi.string().min(5).max(1000),
    size: joi.array().items(joi.string().required()),
    colors: joi.array().items(joi.string().required())
}).required()

export const getProductSchema = joi.object({
    productId: generalFields.id
}).required()

export const updateProductSchema = joi.object({
    name: joi.string().min(3).max(30),
    categoryId: generalFields._id,
    subCategoryId: generalFields._id,
    brandId: generalFields._id,
    productId:generalFields.id,
    price: joi.number().min(1).positive(),
    discount: joi.number().min(1).max(100).positive(),
    stock: joi.number().positive().integer().min(1),
    files: joi.object({
        //mainImage:[{}]
        mainImage: joi.array().items(generalFields.file.required()),
        subImages: joi.array().items(generalFields.file)
    }),
    description: joi.string().min(5).max(1000),
    size: joi.array().items(joi.string().required()),
    colors: joi.array().items(joi.string().required())
}).required()
