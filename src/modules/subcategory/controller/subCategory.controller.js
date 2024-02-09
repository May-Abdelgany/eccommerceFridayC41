import slugify from "slugify";
import categoryModel from "../../../../DB/model/Category.model.js";
import subCategoryModel from "../../../../DB/model/SubCategory.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

//1-find category
//2-find if name of subcateegory exist
//3-upload image
//4-make slug of name
//5-add subcategory
export const createSubCategory = asyncHandler(
    async (req, res, next) => {
        const { categoryId } = req.params
        if (!await categoryModel.findById({ _id: categoryId })) {
            return next(new Error("category not found", { cause: 404 }))
        }
        const { name } = req.body;
        //1
        if (await subCategoryModel.findOne({ name })) {
            // return res.status(409).json({ message: "name already exist" })
            return next(new Error("name already exist", { cause: 409 }))
        }
        //2
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category/${categoryId}/subCategory` })
        if (!public_id) {
            return res.status(400).json({ message: "image is required" })
        }
        req.body.image = { public_id, secure_url }
        //3
        req.body.slug = slugify(name)
        req.body.categoryId = categoryId
        //4
        const newSubCategory = await subCategoryModel.create(req.body)
        return res.status(201).json({ message: "done", subCategory: newSubCategory })
    }
)

//1-find all subCategories
export const allSubCategories = asyncHandler(
    async (req, res, next) => {
        const { categoryId } = req.params
        const subCategories = await subCategoryModel.find(
            { categoryId }
        ).populate([
            {
                path: 'categoryId'
            }
        ])
        return res.status(200).json({ message: "done", subCategories })
    }
)
export const oneSubCategory = asyncHandler(
    async (req, res, next) => {
        const subCategory = await subCategoryModel.findById(
            { _id: req.params.subCategoryId }
        ).populate([
            {
                path: 'categoryId'
            }
        ])
        return res.status(200).json({ message: "done", subCategory })
    }

)


//1-find if category exist
//2- if update name -->find if name exist  -->change slug 
//3-if update image -->upload new image -->delete old image
//4-update category
export const updateSubCategory = asyncHandler(
    async (req, res, next) => {

        const { subCategoryId } = req.params
        const subcategory = await subCategoryModel.findById({ _id: subCategoryId })
        if (!subcategory) {
            return res.status(404).json({ message: "subcategory not found" })
        }


        if (req.body.name) {
            //1
            if (await subCategoryModel.findOne({ name: req.body.name })) {
                return res.status(409).json({ message: "name already exist" })
            }
            req.body.slug = slugify(req.body.name)
        }

        if (req.file) {
            //2
            const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category/${req.params.categoryId}/subCategory` })
            if (!public_id) {
                return res.status(400).json({ message: "image is required" })
            }
            req.body.image = { public_id, secure_url }

            await cloudinary.uploader.destroy(subcategory.image.public_id)
        }


        //4

        const updatedSubCategory = await subCategoryModel.findOneAndUpdate({ _id: subCategoryId }, req.body, { new: true })
        return res.status(201).json({ message: "done", subCategory: updatedSubCategory })
    }
)
