import express from "express";

import {
    showHomePage,
    showGamePage
} from "../controllers/view.controller.js";

const router = express.Router();

router.get("/", showHomePage);
router.get("/game/:boardId", showGamePage);

export default router;