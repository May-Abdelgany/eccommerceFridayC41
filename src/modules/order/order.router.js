import express,{ Router } from "express";
import * as orderController from './controller/order.controller.js'
import * as orderValidation from './order.validation.js'

import orderEndPoints from './order.endPoint.js'
import auth from "../../middleware/auth.js";
import validation from "../../middleware/validation.js";
const router = Router()



router.post(
    '/',
    validation(orderValidation.tokenSchema, true),
    validation(orderValidation.createOrderSchema),
    auth(orderEndPoints.createOrder),
    orderController.createOrder
)


router.put('/cancelOrder/:orderId',
    validation(orderValidation.tokenSchema, true),
    validation(orderValidation.cancelOrder),
    auth(orderEndPoints.createOrder),
    orderController.cancelOrder
)

router.put('/deliverdOrder/:orderId',
    validation(orderValidation.tokenSchema, true),
    validation(orderValidation.cancelOrder),
    auth(orderEndPoints.deliverdOrder),
    orderController.deliverdOrder
)









router.post('/webhook', express.raw({type: 'application/json'}), orderController.webHook);


export default router