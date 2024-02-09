import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";
export const tokenSchema = joi
  .object({
    authorization: joi.string().required(),
  })
  .required();

export const oneBrandSchema = joi
  .object({
    brandId: generalFields.id,
  })
  .required();

export const createBrandSchema = joi
  .object({
    name: joi.string().min(3).max(25).trim().required(),
    file: generalFields.file.required(),
  })
  .required();

export const updateBrandSchema = joi
  .object({
    name: joi.string().min(3).max(25).trim(),
    file: generalFields.file,
    brandId: generalFields.id,
  })
  .required();
