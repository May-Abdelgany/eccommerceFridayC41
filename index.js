import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("./config/.env") });
import express from "express";

import initApp from "./src/index.router.js";
const app = express();

// setup port and the baseUrl
const port = process.env.PORT || 5000;
initApp(app, express);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
