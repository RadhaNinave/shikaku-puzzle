const cells = document.querySelectorAll(".cell");
const resetButton = document.getElementById("resetButton");

let isDragging = false;
let startCell = null;

// ========================================
// Show puzzle clues
// ========================================

rectangles.forEach((rectangle) => {

    const cell = document.querySelector(
        `[data-row="${rectangle.clueRow}"][data-column="${rectangle.clueColumn}"]`
    );

    if (!cell) {
        return;
    }

    const area = rectangle.width * rectangle.height;

    cell.textContent = area;
});


// ========================================
// Mouse down
// ========================================

cells.forEach((cell) => {

    cell.addEventListener("mousedown", (event) => {

        event.preventDefault();

        // Don't allow starting selection from locked cell
        if (cell.classList.contains("locked")) {
            return;
        }

        isDragging = true;

        startCell = {
            row: Number(cell.dataset.row),
            column: Number(cell.dataset.column)
        };

        clearSelection();

        cell.classList.add("selected");
    });


    // ========================================
    // Mouse enter
    // ========================================

    cell.addEventListener("mouseenter", () => {

        if (!isDragging || !startCell) {
            return;
        }

        const currentCell = {
            row: Number(cell.dataset.row),
            column: Number(cell.dataset.column)
        };

        showRectangle(startCell, currentCell);
    });

});


// ========================================
// Mouse up
// ========================================

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


// ========================================
// Show selected rectangle
// ========================================

function showRectangle(start, end) {

    clearSelection();

    const startRow = Math.min(
        start.row,
        end.row
    );

    const endRow = Math.max(
        start.row,
        end.row
    );

    const startColumn = Math.min(
        start.column,
        end.column
    );

    const endColumn = Math.max(
        start.column,
        end.column
    );


    const selectedCells = [];


    // Find cells inside selected rectangle

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


    // Don't allow selection over locked rectangle

    const containsLockedCell = selectedCells.some((cell) => {
        return cell.classList.contains("locked");
    });


    if (containsLockedCell) {
        return;
    }


    // Highlight selected cells

    selectedCells.forEach((cell) => {

        const row = Number(cell.dataset.row);
        const column = Number(cell.dataset.column);

        cell.classList.add("selected");


        // Top border

        if (row === startRow) {
            cell.classList.add("selected-top");
        }


        // Bottom border

        if (row === endRow) {
            cell.classList.add("selected-bottom");
        }


        // Left border

        if (column === startColumn) {
            cell.classList.add("selected-left");
        }


        // Right border

        if (column === endColumn) {
            cell.classList.add("selected-right");
        }
    });
}


// ========================================
// Get selected rectangle
// ========================================

function getSelectedRectangle() {

    const selectedCells = document.querySelectorAll(
        ".cell.selected"
    );


    if (selectedCells.length === 0) {
        return null;
    }


    const rows = [];
    const columns = [];


    selectedCells.forEach((cell) => {

        rows.push(
            Number(cell.dataset.row)
        );

        columns.push(
            Number(cell.dataset.column)
        );
    });


    return {

        startRow: Math.min(...rows),

        startColumn: Math.min(...columns),

        endRow: Math.max(...rows),

        endColumn: Math.max(...columns)

    };
}


// ========================================
// Select rectangle API
// ========================================

async function selectRectangle(rectangle) {

    try {

        const response = await fetch(
            `/shikaku/select/${boardId}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(rectangle)
            }
        );


        const result = await response.json();


        if (!response.ok) {

            console.log(
                "Select rectangle error:",
                result.message
            );

            clearSelection();

            return;
        }


        console.log(
            "Rectangle selected:",
            result.data
        );


        // Lock the selected rectangle

        await lockRectangle(rectangle);

    } catch (error) {

        console.log(
            "Select rectangle error:",
            error
        );

        clearSelection();
    }
}


// ========================================
// Lock rectangle API
// ========================================

async function lockRectangle(rectangle) {

    try {

        const response = await fetch(
            `/shikaku/lock/${boardId}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(rectangle)
            }
        );


        const result = await response.json();


        if (!response.ok) {

            console.log(
                "Lock rectangle error:",
                result.message
            );

            clearSelection();

            return;
        }


        console.log(
            "Rectangle locked:",
            result.data
        );


        // Convert selected rectangle into locked rectangle

        lockSelectedCells();


        // Check if game is completed

        await checkWin();

    } catch (error) {

        console.log(
            "Lock rectangle error:",
            error
        );

        clearSelection();
    }
}


// ========================================
// Convert selected cells to locked cells
// ========================================

function lockSelectedCells() {

    const selectedCells = document.querySelectorAll(
        ".cell.selected"
    );


    selectedCells.forEach((cell) => {

        // Save border information before removing classes

        const isTop = cell.classList.contains("selected-top");
        const isBottom = cell.classList.contains("selected-bottom");
        const isLeft = cell.classList.contains("selected-left");
        const isRight = cell.classList.contains("selected-right");


        // Remove selection classes

        cell.classList.remove("selected");

        cell.classList.remove("selected-top");
        cell.classList.remove("selected-bottom");
        cell.classList.remove("selected-left");
        cell.classList.remove("selected-right");


        // Add locked class

        cell.classList.add("locked");


        // Add locked borders

        if (isTop) {
            cell.classList.add("locked-top");
        }

        if (isBottom) {
            cell.classList.add("locked-bottom");
        }

        if (isLeft) {
            cell.classList.add("locked-left");
        }

        if (isRight) {
            cell.classList.add("locked-right");
        }
    });
}


// ========================================
// Check win API
// ========================================

async function checkWin() {

    try {

        const response = await fetch(
            `/shikaku/check-win/${boardId}`
        );


        const result = await response.json();


        console.log(
            "Win response:",
            result
        );


        if (!response.ok) {
            return;
        }


        if (result.data.won) {

            const message = document.getElementById(
                "gameMessage"
            );


            if (message) {

                message.textContent =
                    `Congratulations! You completed the puzzle in ${result.data.totalTime} seconds.`;

            } else {

                alert(
                    `Congratulations! You completed the puzzle in ${result.data.totalTime} seconds.`
                );
            }
        }

    } catch (error) {

        console.log(
            "Check win error:",
            error
        );
    }
}


// ========================================
// Clear current selection
// ========================================

function clearSelection() {

    cells.forEach((cell) => {

        cell.classList.remove("selected");

        cell.classList.remove("selected-top");
        cell.classList.remove("selected-bottom");
        cell.classList.remove("selected-left");
        cell.classList.remove("selected-right");
    });
}

// ========================================
// Reset game
// ========================================

resetButton.addEventListener("click", async () => {

    try {

        resetButton.disabled = true;

        const response = await fetch(
            `/shikaku/reset/${boardId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {

            console.log(
                "Reset error:",
                result.message
            );

            resetButton.disabled = false;

            return;
        }

        console.log(
            "Game reset:",
            result.data
        );

        // Reload the page.
        // The page will load the newly generated puzzle
        // and newly generated clues from MongoDB.
        window.location.reload();

    } catch (error) {

        console.log(
            "Reset game error:",
            error
        );

        resetButton.disabled = false;
    }
});