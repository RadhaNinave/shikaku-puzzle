import Shikaku from "../models/shikaku.model.js";

export const createGameService = async ({ rows, columns }) => {
    const game = await Shikaku.create({
        rows,
        columns
    });

    return game;
};

export const generateRectanglesService = async (boardId) => {
    const game = await Shikaku.findById(boardId);

    if (!game) {
        const error = new Error("Puzzle board not found");
        error.statusCode = 404;
        throw error;
    }

    const rectangles = [];

    for (let i = 0; i < 5; i++) {
        const width = Math.floor(Math.random() * 3) + 1;
        const height = Math.floor(Math.random() * 3) + 1;

        const maxRow = game.rows - height;
        const maxColumn = game.columns - width;

        const row = Math.floor(Math.random() * (maxRow + 1));
        const column = Math.floor(Math.random() * (maxColumn + 1));

        rectangles.push({
            id: i + 1,
            row,
            column,
            width,
            height,
            locked: false
        });
    }

    game.rectangles = rectangles;

    await game.save();

    return rectangles;
};

export const selectRectangleService = async (
    boardId,
    {
        startRow,
        startColumn,
        endRow,
        endColumn
    }
) => {
    const game = await Shikaku.findById(boardId);

    if (!game) {
        const error = new Error("Puzzle board not found");
        error.statusCode = 404;
        throw error;
    }

    const width = Math.abs(endColumn - startColumn) + 1;
    const height = Math.abs(endRow - startRow) + 1;

    return {
        startRow,
        startColumn,
        endRow,
        endColumn,
        width,
        height,
        area: width * height
    };
};
export const lockRectangleService = async (
    boardId,
    {
        startRow,
        startColumn,
        endRow,
        endColumn
    }
) => {
    const game = await Shikaku.findById(boardId);

    if (!game) {
        const error = new Error("Puzzle board not found");
        error.statusCode = 404;
        throw error;
    }

    const selectedWidth =
        Math.abs(endColumn - startColumn) + 1;

    const selectedHeight =
        Math.abs(endRow - startRow) + 1;

    const rectangle = game.rectangles.find((item) => {
        return (
            item.row === Math.min(startRow, endRow) &&
            item.column === Math.min(startColumn, endColumn) &&
            item.width === selectedWidth &&
            item.height === selectedHeight
        );
    });

    if (!rectangle) {
        const error = new Error("Invalid rectangle selection");
        error.statusCode = 400;
        throw error;
    }

    rectangle.locked = true;

    await game.save();

    return rectangle;
};
export const checkWinService = async (boardId) => {
    const game = await Shikaku.findById(boardId);

    if (!game) {
        const error = new Error("Puzzle board not found");
        error.statusCode = 404;
        throw error;
    }

    const allLocked = game.rectangles.length > 0 &&
        game.rectangles.every((rectangle) => rectangle.locked === true);

    if (allLocked) {
        game.status = "completed";
        game.endTime = new Date();

        const totalTime = Math.floor(
            (game.endTime - game.startTime) / 1000
        );

        game.totalTime = totalTime;

        await game.save();
    }

    return {
        won: allLocked,
        status: game.status,
        totalTime: game.totalTime
    };
};

export const resetGameService = async (boardId) => {
    const game = await Shikaku.findById(boardId);

    if (!game) {
        const error = new Error("Puzzle board not found");
        error.statusCode = 404;
        throw error;
    }

    game.status = "playing";
    game.startTime = new Date();
    game.endTime = null;
    game.totalTime = 0;

    game.rectangles = game.rectangles.map((rectangle) => ({
        ...rectangle.toObject?.() || rectangle,
        locked: false
    }));

    await game.save();

    return game;
};

export const getGameTimeService = async (boardId) => {
    const game = await Shikaku.findById(boardId);

    if (!game) {
        const error = new Error("Puzzle board not found");
        error.statusCode = 404;
        throw error;
    }

    let totalTime = game.totalTime;

    if (game.status === "playing") {
        totalTime = Math.floor(
            (Date.now() - game.startTime.getTime()) / 1000
        );
    }

    return {
        totalTime
    };
};