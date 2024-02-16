import Stripe from "stripe";
function payment({
  stripe = new Stripe(process.env.API_KEY_PAYMENT),
  payment_method_types = "card",
  mode = "payment",
  success_url = process.env.SUCCESS_URL,
  cancel_url = process.env.CANCEL_URL,
  discounts = [],
  customer_email,
  line_items: [],
} = {}) {
  const session = stripe.checkout.sessions.create({
    payment_method_types,
    mode,
    success_url,
    cancel_url,
    discounts,
    customer_email,
    line_items,
  });

  return session;
}

export default payment;

// {
//     price_data:{
//         currency:'usd',
//         product_data:{
//             name
//         },
//         unit_amount:
//     },
//     quantity:

// }
