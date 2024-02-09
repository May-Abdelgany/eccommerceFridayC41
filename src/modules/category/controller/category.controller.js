import slugify from "slugify";
import categoryModel from "../../../../DB/model/Category.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";


//1-find if name of cateegory exist
//2-upload image
//3-make slug of name
//4-add category
export const createCategory = asyncHandler(
    async (req, res, next) => {
        const { name } = req.body;
        //1
        if (await categoryModel.findOne({ name })) {
            // return res.status(409).json({ message: "name already exist" })
            return next(new Error("name already exist", { cause: 409 }))
        }
        //2
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category` })
        if (!public_id) {
            return res.status(400).json({ message: "image is required" })
        }
        req.body.image = { public_id, secure_url }
        //3
        req.body.slug = slugify(name)
        //4
        req.body.createdBy = req.user._id
        const newCategory = await categoryModel.create(req.body)
        return res.status(201).json({ message: "done", category: newCategory })
    }
)

//1-find all categories
export const allCategories = asyncHandler(
    async (req, res, next) => {
        const categories = await categoryModel.find().populate([{
            path: 'subCategory'
        }])
        return res.status(200).json({ message: "done", categories })
    }
)
export const oneCategory = asyncHandler(
    async (req, res, next) => {
        const category = await categoryModel.findById({ _id: req.params.categoryId })
        return res.status(200).json({ message: "done", category })
    }

)


//1-find if category exist
//2- if update name -->find if name exist  -->change slug 
//3-if update image -->upload new image -->delete old image
//4-update category
export const updateCategory = asyncHandler(
    async (req, res, next) => {

        const { categoryId } = req.params
        const category = await categoryModel.findById({ _id: categoryId })
        if (!category) {
            return res.status(404).json({ message: "category not found" })
        }


        if (req.body.name) {
            //1
            if (await categoryModel.findOne({ name: req.body.name })) {
                return res.status(409).json({ message: "name already exist" })
            }
            req.body.slug = slugify(req.body.name)
        }

        if (req.file) {
            //2
            const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category` })
            if (!public_id) {
                return res.status(400).json({ message: "image is required" })
            }
            req.body.image = { public_id, secure_url }

            await cloudinary.uploader.destroy(category.image.public_id)
        }


        //4
        req.body.updatedBy = req.user._id
        const updatedCategory = await categoryModel.findOneAndUpdate({ _id: categoryId }, req.body, { new: true })
        return res.status(200).json({ message: "done", category: updatedCategory })
    }
)
