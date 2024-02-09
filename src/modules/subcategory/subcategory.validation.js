import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";
export const tokenSchema = joi
  .object({
    authorization: joi.string().required(),
  })
  .required();

export const oneSubCategorySchema = joi
  .object({
    categoryId: generalFields.id,
    subCategoryId: generalFields.id,
  })
  .required();

export const createSubCategorySchema = joi
  .object({
    name: joi.string().min(3).max(25).trim().required(),
    file: generalFields.file.required(),
    categoryId: generalFields.id,
  })
  .required();

export const updateSubCategorySchema = joi
  .object({
    name: joi.string().min(3).max(25).trim(),
    file: generalFields.file,
    categoryId: generalFields.id,
    subCategoryId: generalFields.id,
  })
  .required();
