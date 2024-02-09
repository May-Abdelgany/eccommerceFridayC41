import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import auth from "../../middleware/auth.js";
import productEndPoints from './product.endPoint.js'
import validation from "../../middleware/validation.js";
import * as productValidation from './product.validation.js'

import * as productController from './controller/product.controller.js'
const router = Router()




router.post(
    '/',
    
    validation(productValidation.tokenSchema, true),
    auth(productEndPoints.create),
    fileUpload(fileValidation.image).fields([
        {
            name: 'mainImage', maxCount: 1
        }, {
            name: 'subImages', maxCount: 5
        }
    ]),
    validation(productValidation.createProductSchema),
    productController.createProduct
)
    .get(
        '/',
        productController.getAllProducts
    )
    .get(
        '/:productId',
        validation(productValidation.getProductSchema),
        productController.getProduct
    )
    .put(
        '/:productId',
        validation(productValidation.tokenSchema, true),
        auth(productEndPoints.update),
        fileUpload(fileValidation.image).fields([
            {
                name: 'mainImage', maxCount: 1
            }, {
                name: 'subImages', maxCount: 5
            }
        ]),
        validation(productValidation.updateProductSchema),
        productController.updateProduct
    )

export default router