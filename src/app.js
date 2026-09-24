// import express from "express";
// import routes from "./routes/index.js";
// import { logger } from "./middleware/logger.middleware.js";
// import { errorHandler } from "./middleware/error.middleware.js";
// import path from "path";
// import { fileURLToPath } from "url";
// const app = express();

// app.use(express.json());
// app.get("/", (req, res) => {
//     res.render("index");
// });
// app.use(logger);
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// app.use(express.static(path.join(__dirname, "public")));
// app.get("/health", (req, res) => {
//   res.send("API is running...");
// });

// app.use("/api", routes);
// app.use(errorHandler);
// export default app;
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