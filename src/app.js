import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";

import { logger } from "./middleware/logger.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(logger);

app.use(routes);

app.use(errorHandler);

export default app;