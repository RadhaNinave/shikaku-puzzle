const socket = io();

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  socket.emit("joinGame", boardId);
});

socket.on("gameWon", (data) => {
  console.log("game won:", data);

  const message = document.getElementById("gameMessage");

  if (message) {
    message.textContent = data.message;
  }
});

const cells = document.querySelectorAll(".cell");
const resetButton = document.getElementById("resetButton");
const timerElement = document.getElementById("timer");

let isDragging = false;
let startCell = null;

let timerInterval = null;
let elapsedSeconds = 0;
let gameCompleted = false;

// put the clue numbers on the board
rectangles.forEach((rectangle) => {
  const cell = document.querySelector(
    `[data-row="${rectangle.clueRow}"][data-column="${rectangle.clueColumn}"]`,
  );

  if (!cell) {
    return;
  }

  const area = rectangle.width * rectangle.height;

  cell.textContent = area;
});

restoreLockedRectangles();

cells.forEach((cell) => {
  cell.addEventListener("mousedown", (event) => {
    event.preventDefault();

    if (gameCompleted) {
      return;
    }

    // Don't allow starting selection from locked cell
    if (cell.classList.contains("locked")) {
      return;
    }

    isDragging = true;

    startCell = {
      row: Number(cell.dataset.row),
      column: Number(cell.dataset.column),
    };

    clearSelection();

    cell.classList.add("selected");
  });

  // dragging over cells while mouse is held down
  cell.addEventListener("mouseenter", () => {
    if (!isDragging || !startCell) {
      return;
    }

    const currentCell = {
      row: Number(cell.dataset.row),
      column: Number(cell.dataset.column),
    };

    showRectangle(startCell, currentCell);
  });
});

document.addEventListener("mouseup", async () => {
  if (!isDragging || !startCell) {
    return;
  }

  isDragging = false;

  const rectangle = getSelectedRectangle();

  startCell = null;

  if (!rectangle) {
    clearSelection();
    return;
  }

  await selectRectangle(rectangle);
});

function showRectangle(start, end) {
  clearSelection();

  const startRow = Math.min(start.row, end.row);

  const endRow = Math.max(start.row, end.row);

  const startColumn = Math.min(start.column, end.column);

  const endColumn = Math.max(start.column, end.column);

  const selectedCells = [];

  cells.forEach((cell) => {
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);

    if (
      row >= startRow &&
      row <= endRow &&
      column >= startColumn &&
      column <= endColumn
    ) {
      selectedCells.push(cell);
    }
  });

  const containsLockedCell = selectedCells.some((cell) =>
    cell.classList.contains("locked"),
  );

  if (containsLockedCell) {
    return;
  }

  selectedCells.forEach((cell) => {
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);

    cell.classList.add("selected");

    if (row === startRow) cell.classList.add("selected-top");
    if (row === endRow) cell.classList.add("selected-bottom");
    if (column === startColumn) cell.classList.add("selected-left");
    if (column === endColumn) cell.classList.add("selected-right");
  });
}

function getSelectedRectangle() {
  const selectedCells = document.querySelectorAll(".cell.selected");

  if (selectedCells.length === 0) {
    return null;
  }

  const rows = [];
  const columns = [];

  selectedCells.forEach((cell) => {
    rows.push(Number(cell.dataset.row));

    columns.push(Number(cell.dataset.column));
  });

  return {
    startRow: Math.min(...rows),

    startColumn: Math.min(...columns),

    endRow: Math.max(...rows),

    endColumn: Math.max(...columns),
  };
}

async function selectRectangle(rectangle) {
  try {
    const response = await fetch(`/shikaku/select/${boardId}`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(rectangle),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Select rectangle error:", result.message);

      clearSelection();

      return;
    }

    console.log("Rectangle selected:", result.data);

    // Lock the selected rectangle

    await lockRectangle(rectangle);
  } catch (error) {
    console.log("Select rectangle error:", error);

    clearSelection();
  }
}

async function lockRectangle(rectangle) {
  try {
    const response = await fetch(`/shikaku/lock/${boardId}`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(rectangle),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log(result.message);
      clearSelection();
      return;
    }

    if (!result.data.valid) {
     
      clearSelection();
      return;
    }

    // Correct rectangle
    lockSelectedCells();

    await checkWin();
  } catch (error) {
    console.log("Lock rectangle error:", error);

    clearSelection();
  }
}

function lockSelectedCells() {
  const selectedCells = document.querySelectorAll(".cell.selected");

  selectedCells.forEach((cell) => {
    const isTop = cell.classList.contains("selected-top");
    const isBottom = cell.classList.contains("selected-bottom");
    const isLeft = cell.classList.contains("selected-left");
    const isRight = cell.classList.contains("selected-right");

    cell.classList.remove(
      "selected",
      "selected-top",
      "selected-bottom",
      "selected-left",
      "selected-right",
    );

    cell.classList.add("locked");

    if (isTop) cell.classList.add("locked-top");
    if (isBottom) cell.classList.add("locked-bottom");
    if (isLeft) cell.classList.add("locked-left");
    if (isRight) cell.classList.add("locked-right");
  });
}

async function checkWin() {
  try {
    const response = await fetch(`/shikaku/check-win/${boardId}`);

    const result = await response.json();

    console.log("Win response:", result);

    if (!response.ok) {
      return;
    }

    // if (result.data.won) {
    //   gameCompleted = true;

    //   // Stop timer
    //   stopTimer();

    //   // Use final time from backend
    //   elapsedSeconds = result.data.totalTime;

    //   updateTimerDisplay();

    //   const message = document.getElementById("gameMessage");

    //   if (message) {
    //     message.textContent = `Congratulations! You completed the puzzle in ${formatTime(result.data.totalTime)}.`;

    //     message.classList.add("success-message");
    //   }
    // }

    if (result.data.won) {
   gameCompleted = true;

      // Stop timer
      stopTimer();

      // Use final time from backend
      elapsedSeconds = result.data.totalTime;

      updateTimerDisplay();
    showWinningMessage(result.data.totalTime);

}
  } catch (error) {
    console.log("Check win error:", error);
  }
}

function showWinningMessage(totalTime) {

    const message = document.getElementById("gameMessage");
    const newGameButton = document.getElementById("newGameButton");

    if (message) {

        message.textContent =
            `Congratulations! You completed the puzzle in ${formatTime(totalTime)}.`;

        message.classList.add("success-message");
    }

    if (newGameButton) {
        newGameButton.style.display = "inline-block";
    }
}
function clearSelection() {
  cells.forEach((cell) => {
    cell.classList.remove("selected");

    cell.classList.remove("selected-top");
    cell.classList.remove("selected-bottom");
    cell.classList.remove("selected-left");
    cell.classList.remove("selected-right");
  });
}

function restoreLockedRectangles() {

    rectangles.forEach((rectangle) => {

        if (!rectangle.locked) {
            return;
        }

        const startRow = rectangle.row;
        const startColumn = rectangle.column;

        const endRow = rectangle.row + rectangle.height - 1;
        const endColumn = rectangle.column + rectangle.width - 1;

        cells.forEach((cell) => {

            const row = Number(cell.dataset.row);
            const column = Number(cell.dataset.column);

            if (
                row >= startRow &&
                row <= endRow &&
                column >= startColumn &&
                column <= endColumn
            ) {

                cell.classList.add("locked");

                if (row === startRow) {
                    cell.classList.add("locked-top");
                }

                if (row === endRow) {
                    cell.classList.add("locked-bottom");
                }

                if (column === startColumn) {
                    cell.classList.add("locked-left");
                }

                if (column === endColumn) {
                    cell.classList.add("locked-right");
                }
            }
        });
    });
}

resetButton.addEventListener("click", async () => {
  try {
    resetButton.disabled = true;

    const response = await fetch(`/shikaku/reset/${boardId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Reset error:", result.message);

      resetButton.disabled = false;

      return;
    }

    console.log("Game reset:", result.data);

    // Reload the page.

    window.location.reload();
  } catch (error) {
    console.log("Reset game error:", error);

    resetButton.disabled = false;
  }
});

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  if (!timerElement) {
    return;
  }

  timerElement.textContent = formatTime(elapsedSeconds);
}

function startTimer() {
  // Prevent multiple timers
  if (timerInterval) {
    return;
  }

  timerInterval = setInterval(() => {
    elapsedSeconds++;

    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);

    timerInterval = null;
  }
}
async function initializeTimer() {
  try {
    const response = await fetch(`/shikaku/time/${boardId}`);

    const result = await response.json();

    if (!response.ok) {
      console.log("Get time error:", result.message);
      return;
    }

    elapsedSeconds = result.data.totalTime;

    updateTimerDisplay();

    if (result.data.status === "completed") {
      return;
    }

    startTimer();
  } catch (error) {
    console.log("Timer initialization error:", error);

    startTimer();
  }
}

initializeTimer();


