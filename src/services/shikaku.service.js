import Shikaku from "../models/shukaku.model.js";

export const createGameService = async ({ rows, columns }) => {
  const game = await Shikaku.create({
    rows,
    columns,
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

  const board = [];

  for (let row = 0; row < game.rows; row++) {
    board[row] = [];

    for (let column = 0; column < game.columns; column++) {
      board[row][column] = false;
    }
  }

  const rectangles = [];

  const canPlaceRectangle = (row, column, width, height) => {
    if (row + height > game.rows) {
      return false;
    }

    if (column + width > game.columns) {
      return false;
    }

    for (let r = row; r < row + height; r++) {
      for (let c = column; c < column + width; c++) {
        if (board[r][c]) {
          return false;
        }
      }
    }

    return true;
  };

  const placeRectangle = (row, column, width, height) => {
    for (let r = row; r < row + height; r++) {
      for (let c = column; c < column + width; c++) {
        board[r][c] = true;
      }
    }
  };

  const removeRectangle = (row, column, width, height) => {
    for (let r = row; r < row + height; r++) {
      for (let c = column; c < column + width; c++) {
        board[r][c] = false;
      }
    }
  };

  const generate = () => {
    let emptyRow = -1;
    let emptyColumn = -1;

    // Find first empty cell
    for (let row = 0; row < game.rows; row++) {
      for (let column = 0; column < game.columns; column++) {
        if (!board[row][column]) {
          emptyRow = row;
          emptyColumn = column;
          break;
        }
      }

      if (emptyRow !== -1) {
        break;
      }
    }

    // Board is completely filled
    if (emptyRow === -1) {
      return true;
    }

    const possibleRectangles = [];

    // Generate possible rectangles
    for (let height = 1; height <= 3; height++) {
      for (let width = 1; width <= 3; width++) {
        const area = width * height;

        if (area < 2 || area > 6) {
          continue;
        }

        if (canPlaceRectangle(emptyRow, emptyColumn, width, height)) {
          possibleRectangles.push({
            width,
            height,
          });
        }
      }
    }

    // Randomize rectangles
    possibleRectangles.sort(() => Math.random() - 0.5);

    for (const rectangle of possibleRectangles) {
      const { width, height } = rectangle;

      placeRectangle(emptyRow, emptyColumn, width, height);

      const clueRow = emptyRow + Math.floor(Math.random() * height);

      const clueColumn = emptyColumn + Math.floor(Math.random() * width);

      rectangles.push({
        id: rectangles.length + 1,
        row: emptyRow,
        column: emptyColumn,
        width,
        height,
        clueRow,
        clueColumn,
        locked: false,
      });

      if (generate()) {
        return true;
      }

      // Backtrack
      rectangles.pop();

      removeRectangle(emptyRow, emptyColumn, width, height);
    }

    return false;
  };

  const generated = generate();

  if (!generated) {
    const error = new Error("Unable to generate puzzle");
    error.statusCode = 500;
    throw error;
  }

  game.rectangles = rectangles;

  await game.save();

  return rectangles;
};
export const selectRectangleService = async (
  boardId,
  { startRow, startColumn, endRow, endColumn },
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
    area: width * height,
  };
};
export const lockRectangleService = async (
  boardId,
  { startRow, startColumn, endRow, endColumn },
) => {
  const game = await Shikaku.findById(boardId);

  if (!game) {
    const error = new Error("Puzzle board not found");
    error.statusCode = 404;
    throw error;
  }

  const selectedWidth = Math.abs(endColumn - startColumn) + 1;

  const selectedHeight = Math.abs(endRow - startRow) + 1;

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

  const allLocked =
    game.rectangles.length > 0 &&
    game.rectangles.every((rectangle) => rectangle.locked === true);

  if (allLocked) {
    game.status = "completed";
    game.endTime = new Date();

    const totalTime = Math.floor((game.endTime - game.startTime) / 1000);

    game.totalTime = totalTime;

    await game.save();
  }

  return {
    won: allLocked,
    status: game.status,
    totalTime: game.totalTime,
  };
};

export const resetGameService = async (boardId) => {
  const game = await Shikaku.findById(boardId);

  if (!game) {
    const error = new Error("Puzzle board not found");
    error.statusCode = 404;
    throw error;
  }

  // Reset game state
  game.status = "playing";
  game.startTime = new Date();
  game.endTime = null;
  game.totalTime = 0;

  // set to empty rectangles array
  game.rectangles = [];

  await game.save();

  // Generate a completely new puzzle
  const rectangles = await generateRectanglesService(boardId);

  return rectangles;
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
    totalTime = Math.floor((Date.now() - game.startTime.getTime()) / 1000);
  }

  return {
    totalTime,
  };
};
