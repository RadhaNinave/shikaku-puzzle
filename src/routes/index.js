import express from "express";

import shikakuRoutes from "./shikaku.routes.js";
import viewRoutes from "./view.routes.js";
const router = express.Router();

router.use("/shikaku", shikakuRoutes);
router.use("/view", viewRoutes);

export default router;