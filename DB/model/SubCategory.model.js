import mongoose, { Schema, Types, model } from "mongoose";

const subCategorySchema = new Schema({
    name: {
        type: String,
        unique: [true, 'name must be unique'],
        required: [true, 'name is required'],
        trim: true,
        lowercase: true
    },
    slug: {
        type: String,
        unique: [true, 'slug must be unique'],
        required: [true, 'slug is required'],
        trim: true,
        lowercase: true
    },
    image: {
        type: Object,
        required: [true, 'image is required']
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: [true, 'userId is required']   //replace to true
    },
    categoryId: {
        type: Types.ObjectId,
        ref: 'Category',
        required: [true, 'categoryId is required']
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// mongoose.model.SubCategory ||
const subCategoryModel = model('SubCategory', subCategorySchema)

export default subCategoryModel