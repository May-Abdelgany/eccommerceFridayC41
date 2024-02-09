import couponModel from "../../../../DB/model/Coupon.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";


//1-get all data
//2-check if name exist 
//3-if upload image  -->req.body.image
//4-create coupon
export const createCoupon = asyncHandler(
    async (req, res, next) => {
        const coupon = await couponModel.findOne({ name: req.body.name })
        if (coupon) {
            return next(new Error('name already exist', { cause: 409 }))
        }
        if (req.file) {
            const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/coupon` })
            req.body.image = { public_id, secure_url }
        }
        const newCoupon = await couponModel.create(req.body)
        res.status(201).json({ message: "done", newCoupon })
    }
)


export const getAllCoupons = asyncHandler(
    async (req, res, next) => {
        const allCoupons = await couponModel.find()
        return res.status(200).json({ message: "done", allCoupons })
    }
)

export const getOneCoupon = asyncHandler(
    async (req, res, next) => {
        const coupon = await couponModel.findById({ _id: req.params.couponId })
        return res.status(200).json({ message: "done", coupon })
    }
)



//1-check if coupon exist 
//2-if name exist 
//3-if upload image 


export const updateCoupon = asyncHandler(
    async (req, res, next) => {

        const { couponId } = req.params
        const coupon = await couponModel.findById({ _id: couponId })
        if (!coupon) {
            return next(new Error('invalid coupon id'))
        }

        if (req.body.name) {
            const nameExist = await couponModel.findOne({ name: req.body.name })
            if (nameExist) {
                return next(new Error('name already exist', { cause: 409 }))
            }
        }

        if (req.file) {
            const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/coupon` })
            req.body.image = { public_id, secure_url }
            if (coupon.image) {
                await cloudinary.uploader.destroy(coupon.image.public_id)
            }
        }

        const updatedCoupon = await couponModel.findByIdAndUpdate({ _id: couponId }, req.body, { new: true })
        return res.status(200).json({ message: "done", coupon: updatedCoupon })
    }
)