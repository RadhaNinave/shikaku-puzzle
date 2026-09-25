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
    board.push(new Array(game.columns).fill(false));
  }

  const isFree = (row, column, width, height) => {
    for (let r = row; r < row + height; r++) {
      for (let c = column; c < column + width; c++) {
        if (board[r][c]) return false;
      }
    }
    return true;
  };

  const fill = (row, column, width, height) => {
    for (let r = row; r < row + height; r++) {
      for (let c = column; c < column + width; c++) {
        board[r][c] = true;
      }
    }
  };

  let rectangles = [];

  // all sizes bigger than 1x1
  const sizes = [];
  for (let h = 1; h <= 3; h++) {
    for (let w = 1; w <= 3; w++) {
      if (w * h > 1) sizes.push({ w, h });
    }
  }


  for (let row = 0; row < game.rows; row++) {
    for (let column = 0; column < game.columns; column++) {
      if (board[row][column]) continue;

      const shuffled = [...sizes].sort(() => Math.random() - 0.5);

      let width = 1;
      let height = 1;

      for (const size of shuffled) {
        if (
          size.w <= game.columns - column &&
          size.h <= game.rows - row &&
          isFree(row, column, size.w, size.h)
        ) {
          width = size.w;
          height = size.h;
          break;
        }
      }

      fill(row, column, width, height);

      rectangles.push({ row, column, width, height, locked: false });
    }
  }

  for (const rect of rectangles) {
    if (rect.width * rect.height !== 1) continue;

    const left = rectangles.find(
      (r) => r !== rect && r.height === 1 && r.row === rect.row &&
        r.column + r.width === rect.column
    );

    if (left) {
      left.width += 1;
      rect.width = 0;
      continue;
    }

    const above = rectangles.find(
      (r) => r !== rect && r.width === 1 && r.column === rect.column &&
        r.row + r.height === rect.row
    );

    if (above) {
      above.height += 1;
      rect.width = 0;
    }
  }

  rectangles = rectangles
    .filter((r) => r.width > 0)
    .map((r, index) => ({
      id: index + 1,
      ...r,
      clueRow: r.row + Math.floor(Math.random() * r.height),
      clueColumn: r.column + Math.floor(Math.random() * r.width),
    }));

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
  { startRow, startColumn, endRow, endColumn }
) => {
  const game = await Shikaku.findById(boardId);

  if (!game) {
    const error = new Error("Puzzle board not found");
    error.statusCode = 404;
    throw error;
  }

  const minRow = Math.min(startRow, endRow);
  const minColumn = Math.min(startColumn, endColumn);

  const selectedWidth = Math.abs(endColumn - startColumn) + 1;
  const selectedHeight = Math.abs(endRow - startRow) + 1;

  const rectangleIndex = game.rectangles.findIndex((item) => {
    return (
      item.row === minRow &&
      item.column === minColumn &&
      item.width === selectedWidth &&
      item.height === selectedHeight
    );
  });

  // no matching rectangle at this position just an invalid drag
  if (rectangleIndex === -1) {
    return {
      valid: false,
      locked: false
    };
  }

  const rectangle = game.rectangles[rectangleIndex];

  if (rectangle.locked) {
    return {
      id: rectangle.id,
      row: rectangle.row,
      column: rectangle.column,
      width: rectangle.width,
      height: rectangle.height,
      clueRow: rectangle.clueRow,
      clueColumn: rectangle.clueColumn,
      locked: true,
      valid: true
    };
  }

  rectangle.locked = true;

 
  game.markModified("rectangles");

  await game.save();

  return {
    id: rectangle.id,
    row: rectangle.row,
    column: rectangle.column,
    width: rectangle.width,
    height: rectangle.height,
    clueRow: rectangle.clueRow,
    clueColumn: rectangle.clueColumn,
    locked: true,
    valid: true
  };
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
        game.rectangles.every(
            (rectangle) => rectangle.locked === true
        );

    if (allLocked && game.status !== "completed") {

        game.status = "completed";
        game.endTime = new Date();

        game.totalTime = Math.floor(
            (game.endTime - game.startTime) / 1000
        );

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
  game.rectangles = [];

  await game.save();

  const rectangles = await generateRectanglesService(boardId);

  return rectangles;
};

export const getGameTimeService = async (boardId, stop = false) => {
  const game = await Shikaku.findById(boardId);

  if (!game) {
    const error = new Error("Puzzle board not found");
    error.statusCode = 404;
    throw error;
  }

  if (game.status !== "playing") {
    return { totalTime: game.totalTime, status: game.status };
  }

  const elapsed = Math.floor((Date.now() - game.startTime.getTime()) / 1000);

  if (!stop) {
    return { totalTime: elapsed, status: game.status };
  }

  game.status = "paused";
  game.endTime = new Date();
  game.totalTime = elapsed;
  await game.save();

  return { totalTime: elapsed, status: game.status };
};
