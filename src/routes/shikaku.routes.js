import express from "express";

import { createGame,generateRectangles,selectRectangle, lockRectangle,resetGame,checkWin,getGameTime } from "../controllers/shikaku.controller.js";
import { validate } from "../middleware/validation.middleware.js";
import { createShikakuSchema,lockRectangleSchema,selectRectangleSchema } from "../validations/shikaku.validation.js";

const router = express.Router();

router.post(
    "/create",
    validate(createShikakuSchema),
    createGame
);

router.post(
    "/rectangles/:boardId",
    generateRectangles
);

router.post(
    "/select/:boardId",
    validate(selectRectangleSchema),
    selectRectangle
);

router.post(
    "/lock/:boardId",
    validate(lockRectangleSchema),
    lockRectangle
);
router.get(
    "/check-win/:boardId",
    checkWin
);

router.post(
    "/reset/:boardId",
    resetGame
);
router.get(
    "/time/:boardId",
    getGameTime
);
export default router;