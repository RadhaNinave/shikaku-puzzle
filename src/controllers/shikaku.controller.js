import {
  createGameService,
  generateRectanglesService,
  selectRectangleService,
  lockRectangleService,
  checkWinService,
  resetGameService,
  getGameTimeService,
} from "../services/shikaku.service.js";

import { isValidObjectId } from "../validations/shikaku.validation.js";

export const createGame = async (req, res) => {
  try {
    const game = await createGameService(req.body);

    return res.status(201).json({
      success: true,
      message: "Puzzle board created successfully",
      data: game,
    });
  } catch (error) {
    console.log("Create game error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create puzzle board",
    });
  }
};

export const generateRectangles = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!isValidObjectId(boardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID",
      });
    }

    const rectangles = await generateRectanglesService(boardId);

    return res.status(200).json({
      success: true,
      message: "Rectangles generated successfully",
      data: rectangles,
    });
  } catch (error) {
    console.log("Generate rectangles error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to generate rectangles",
    });
  }
};

export const selectRectangle = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!isValidObjectId(boardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID",
      });
    }

    const rectangle = await selectRectangleService(boardId, req.body);

    return res.status(200).json({
      success: true,
      message: "Rectangle selected successfully",
      data: rectangle,
    });
  } catch (error) {
    console.log("Select rectangle error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to select rectangle",
    });
  }
};

export const lockRectangle = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!isValidObjectId(boardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID",
      });
    }

    const rectangle = await lockRectangleService(boardId, req.body);

    return res.status(200).json({
      success: true,
      message: rectangle
        ? "Rectangle locked successfully"
        : "Selection completed",
      data: rectangle,
    });
  } catch (error) {
    console.log("Lock rectangle error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to lock rectangle",
    });
  }
};

export const checkWin = async (req, res) => {
    try {
        const { boardId } = req.params;

        if (!isValidObjectId(boardId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid board ID"
            });
        }

        const result = await checkWinService(boardId);

        // Send socket message only when game is completed
        if (result.won) {
            const io = req.app.get("io");

            io.to(boardId).emit("gameWon", {
                message: `Congratulations! You completed the puzzle in ${result.totalTime} seconds.`,
                totalTime: result.totalTime
            });
        }

        return res.status(200).json({
            success: true,
            message: result.won
                ? "Congratulations! You won the game."
                : "Game is not completed yet",
            data: result
        });

    } catch (error) {
        console.log("Check win error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to check win"
        });
    }
};
export const resetGame = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!isValidObjectId(boardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID",
      });
    }

    const game = await resetGameService(boardId);

    return res.status(200).json({
      success: true,
      message: "Game reset successfully",
      data: game,
    });
  } catch (error) {
    console.log("Reset game error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to reset game",
    });
  }
};
export const getGameTime = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!isValidObjectId(boardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID",
      });
    }

    const stop = req.query.stop === "true";

    const result = await getGameTimeService(boardId, stop);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("Get game time error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get game time",
    });
  }
};
