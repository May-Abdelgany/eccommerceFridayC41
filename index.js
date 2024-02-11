import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("./config/.env") });
import express from "express";

import initApp from "./src/index.router.js";
import createInvoice from "./src/utils/createPdf/createPdf.js";
const app = express();

// setup port and the baseUrl
const port = process.env.PORT || 5000;
initApp(app, express);

// const invoice = {
//   shipping: {
//     name: "John Doe",
//     address: "1234 Main Street",
//     city: "San Francisco",
//     state: "CA",
//     country: "US",
//     postal_code: 94111
//   },
//   items: [
//     {
//       item: "TC 100",
//       description: "Toner Cartridge",
//       quantity: 2,
//       amount: 6000
//     },
//     {
//       item: "USB_EXT",
//       description: "USB Cable Extender",
//       quantity: 1,
//       amount: 2000
//     }
//   ],
//   subtotal: 8000,
//   paid: 0,
//   invoice_nr: 1234
// };

//  createInvoice(invoice, "invoice.pdf");
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
