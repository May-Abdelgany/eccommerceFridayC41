import Stripe from "stripe";
import cartModel from "../../../../DB/model/Cart.model.js";
import couponModel from "../../../../DB/model/Coupon.model.js";
import orderModel from "../../../../DB/model/Order.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import createInvoice from "../../../utils/createPdf.js";
import sendEmail from "../../../utils/email.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import payment from "../../../utils/payment.js";

//1-check if coupon
//2-send products
//3-loop for products -->check if exist
//4-name,unitprice,finalPrice
//5-calc subPrice
//6-add product to array
export const createOrder = asyncHandler(async (req, res, next) => {
  let { products, couponName } = req.body;

  let amount = 0;
  if (couponName) {
    const coupon = await couponModel.findOne({
      name: couponName,
      usedBy: { $nin: req.user._id },
    });
    if (!coupon || coupon.expireIn < new Date()) {
      return next(new Error("invalid coupon", { cause: 400 }));
    }
    amount = coupon.amount;
    req.body.couponId = coupon._id;
  }

  if (!products?.length) {
    const cart = await cartModel.findOne({ userId: req.user._id });
    if (!cart || !cart.products.length) {
      return next(new Error("invalid cart", { cause: 400 }));
    }
    products = cart.products.toObject();
  }

  let subPrice = 0;
  const allProducts = [];
  for (const product of products) {
    const existProduct = await productModel.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
    });
    if (!existProduct) {
      return next(new Error("invalid product", { cause: 400 }));
    }
    product.name = existProduct.name;
    product.unitPrice = existProduct.totalPrice;
    product.finalPrice = product.unitPrice * product.quantity;
    subPrice += product.finalPrice;
    allProducts.push(product);
  }
  req.body.products = allProducts;
  req.body.subPrice = subPrice;
  req.body.totalPrice = subPrice - (subPrice * amount) / 100;
  req.body.userId = req.user._id;
  req.body?.paymentType == "cash"
    ? (req.body.status = "placed")
    : (req.body.status = "waitForPayment");
  for (const product of products) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: -parseInt(product.quantity) } }
    );
    await cartModel.updateOne(
      { userId: req.user._id },
      {
        $pull: {
          products: {
            productId: product.productId,
          },
        },
      }
    );
  }

  if (couponName) {
    await couponModel.updateOne(
      { _id: req.body.couponId },
      { $push: { usedBy: req.user._id } }
    );
  }

  const order = await orderModel.create(req.body);
  const invoice = {
    shipping: {
      name: req.user.userName,
      address: order.address,
      city: "San Francisco",
      state: "CA",
      country: "US",
      postal_code: 94111,
    },
    items: order.products,
    subtotal: order.totalPrice,
    paid: 0,
    date: order.createdAt,
    invoice_nr: order._id.toString(),
  };
  // createInvoice(invoice, "invoice.pdf");
  // await sendEmail({
  //   to: req.user.email,
  //   subject: "invoice",
  //   attachments: [
  //     {
  //       path: "invoice.pdf",
  //       type: "application/pdf",
  //     },
  //   ],
  // });

  //payment method card
  if (order.paymentType == "card") {
    const stripe = new Stripe(process.env.API_KEY_PAYMENT);
    let couponStripe;
    if (couponName) {
      couponStripe = await stripe.coupons.create({
        percent_off: amount,
        duration: "once",
      });
    }

    const session = await payment({
      metadata: {
        orderId: order._id.toString(),
      },
      discounts: amount ? [{ coupon: couponStripe.id }] : [],
      success_url: `${process.env.SUCCESS_URL}/${order._id}`,
      cancel_url: `${process.env.CANCEL_URL}/${order._id}`,
      customer_email: req.user.email,
      line_items: order.products.map((element) => {
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: element.name,
            },
            unit_amount: element.unitPrice * 100,
          },
          quantity: element.quantity,
        };
      }),
    });
    return res.json({ message: "done", order, session });
  }

  return res.json({ message: "done", order });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await orderModel.findOne({
    _id: orderId,
    userId: req.user._id,
  });
  if (!order) {
    return next(new Error("invalid order", { cause: 404 }));
  }

  if (order.status == "placed" || order.status == "waitForPayment") {
    for (const product of order.products) {
      await productModel.updateOne(
        { _id: product.productId },
        { $inc: { stock: parseInt(product.quantity) } }
      );
    }
    if (order.couponId) {
      await couponModel.updateOne(
        { _id: order.couponId },
        { $pull: { usedBy: req.user._id } }
      );
    }
    order.status = "canceld";
    order.updatedBy = req.user._id;
    await order.save();
    return res.status(200).json({ message: "done", order });
  } else {
    return next(new Error("invalid canceld order ", { cause: 400 }));
  }
});

export const deliverdOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await orderModel.findById({ _id: orderId });
  if (!order) {
    return next(new Error("invalid order", { cause: 404 }));
  }

  if (order.status != "onWay") {
    return next(new Error("invalid deliverd order", { cause: 400 }));
  }

  order.status = "deliverd";
  order.updatedBy = req.user._id;
  await order.save();
  return res.status(200).json({ message: "done", order });
});

export const webHook = asyncHandler(async (req, res, next) => {
  const stripe = new Stripe(process.env.API_KEY_PAYMENT);
  const endpointSecret = process.env.END_POINT_SECRET;

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type == "checkout.session.completed") {
    console.log(event);
    let orderId = event.data.object.metadata.orderId;
    const updateOrder = await orderModel.updateOne(
      { _id: orderId },
      { status: "placed" }
    );
    return res.json({ message: "done" });
  }
  return next(new Error("failed to payment", { cause: 500 }));
});
