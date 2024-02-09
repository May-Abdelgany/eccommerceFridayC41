import { Router } from "express";
const router = Router()
import * as cartController from './controller/cart.controller.js'
import * as cartValidation from './cart.validation.js'

import cartEndPoints from './cart.endPoint.js'
import auth from "../../middleware/auth.js";
import validation from "../../middleware/validation.js";
//add cart  -->add products to cart
//delete product from cart 
//remove products from cart 



// router.get('/', (req ,res)=>{
//     res.status(200).json({message:"Cart Module"})
// })

router.post('/',
    validation(cartValidation.tokenSchema, true),
    validation(cartValidation.addToCartSchema),
    auth(cartEndPoints.addToCart),
    cartController.addToCart
)

router.patch('/:productId',
    validation(cartValidation.tokenSchema, true),
    validation(cartValidation.removeFromCartSchema),
    auth(cartEndPoints.addToCart),
    cartController.removeFromCart
)

router.patch('/',
    validation(cartValidation.tokenSchema, true),
    auth(cartEndPoints.addToCart),
    cartController.deleteProductsFromCart
)

export default router