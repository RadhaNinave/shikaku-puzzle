import express from "express";
import routes from "./routes/index.js";
const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.send("API is running...");
});

app.use("/api", routes);

export default app;
