import cartModel from "../../../../DB/model/Cart.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
//1-check if cart exist
//2-check if product exist stock > quantity
//3-check in cart if product exist -->update quantity -->add to cart

export const addToCart = asyncHandler(
    async (req, res, next) => {
        const { productId, quantity } = req.body

        const product = await productModel.findOne({ _id: productId, stock: { $gte: quantity } })
        if (!product) {
            return next(new Error('invalid product', { cause: 400 }))
        }
        const cart = await cartModel.findOne({ userId: req.user._id })
        if (!cart) {
            const cartCreated = await cartModel.create({ userId: req.user._id, products: [{ productId, quantity }] })
            return res.status(201).json({ message: 'done', cartCreated })
        }
        let match = false
        for (const product of cart.products) {
            if (product.productId == productId) {
                product.quantity = quantity
                match = true
                break;
            }
        }
        if (!match) {
            cart.products.push({ productId, quantity })
        }
        await cart.save()
        return res.status(200).json({ message: 'done', cart })
    }
)

export const removeFromCart = asyncHandler(
    async (req, res, next) => {
        const { productId } = req.params
        const product = await productModel.findOne({ _id: productId })
        if (!product) {
            return next(new Error('invalid product', { cause: 400 }))
        }
        const cart = await cartModel.findOne({ userId: req.user._id })
        if (!cart) {
            return next(new Error('invalid cart', { cause: 404 }))
        }
        // let cart2 = []
        // for (let product of cart.products) {
        //     if (product.productId != productId) {
        //         cart.push(cart2)
        //     }
        // }
        // cart.products = cart2
        const updateCart = await cartModel.findOneAndUpdate({ userId: req.user._id }, {
            $pull: {
                products: {
                    productId: productId
                }
            }
        }, { new: true })

        return res.status(200).json({ message: 'done', updateCart })
    }
)

export const deleteProductsFromCart = asyncHandler(
    async (req, res, next) => {

        const cart = await cartModel.findOne({ userId: req.user._id })
        if (!cart) {
            return next(new Error('invalid cart', { cause: 404 }))
        }
        const updateCart = await cartModel.findOneAndUpdate({ userId: req.user._id }, {
            products: []
        }, { new: true })

        return res.status(200).json({ message: 'done', updateCart })
    }
)