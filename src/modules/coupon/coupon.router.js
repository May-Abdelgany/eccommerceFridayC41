import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import validation from "../../middleware/validation.js";
import * as couponController from './controller/coupon.controller.js'
import * as couponValidation from './coupon.validation.js'
const router = Router()
router.post('/',
    fileUpload(fileValidation.image).single('image'),
    validation(couponValidation.createCouponSchema),
    couponController.createCoupon)
    .get('/', couponController.getAllCoupons)
    .get('/:couponId',
        validation(couponValidation.getOneCouponSchema),
        couponController.getOneCoupon)
    .put('/:couponId',
        fileUpload(fileValidation.image).single('image'),
        validation(couponValidation.updateCouponSchema),
        couponController.updateCoupon)
export default router