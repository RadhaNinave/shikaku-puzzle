import express from "express";

import shikakuRoutes from "./shikaku.routes.js";

const router = express.Router();

router.use("/shikaku", shikakuRoutes);

export default router;