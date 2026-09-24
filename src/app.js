import express from "express";
import routes from "./routes/index.js";
import { logger } from "./middleware/logger.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
const app = express();

app.use(express.json());
app.use(logger);
app.get("/health", (req, res) => {
  res.send("API is running...");
});

app.use("/api", routes);
app.use(errorHandler);
export default app;
