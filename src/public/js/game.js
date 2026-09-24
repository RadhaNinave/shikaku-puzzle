const cells = document.querySelectorAll(".cell");

let isDragging = false;
let startCell = null;

let selectedCells = new Set();


// Display puzzle numbers
rectangles.forEach((rectangle) => {
    const cell = document.querySelector(
        `[data-row="${rectangle.row}"][data-column="${rectangle.column}"]`
    );

    if (!cell) {
        return;
    }

    const area = rectangle.width * rectangle.height;

    cell.textContent = area;
});


// Mouse down
cells.forEach((cell) => {

    cell.addEventListener("mousedown", (event) => {

        event.preventDefault();

        isDragging = true;

        startCell = {
            row: Number(cell.dataset.row),
            column: Number(cell.dataset.column)
        };

        clearSelection();

        cell.classList.add("selected");
    });


    // Mouse enter while dragging
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


// Mouse up
document.addEventListener("mouseup", () => {

    if (!isDragging || !startCell) {
        return;
    }

    isDragging = false;

    console.log("Selected rectangle:", getSelectedRectangle());

    startCell = null;
});


function showRectangle(start, end) {

    clearSelection();

    const startRow = Math.min(start.row, end.row);
    const endRow = Math.max(start.row, end.row);

    const startColumn = Math.min(
        start.column,
        end.column
    );

    const endColumn = Math.max(
        start.column,
        end.column
    );


    cells.forEach((cell) => {

        const row = Number(cell.dataset.row);
        const column = Number(cell.dataset.column);

        if (
            row >= startRow &&
            row <= endRow &&
            column >= startColumn &&
            column <= endColumn
        ) {
            cell.classList.add("selected");
        }
    });
}


function getSelectedRectangle() {

    const selected = document.querySelectorAll(".cell.selected");

    if (selected.length === 0) {
        return null;
    }

    const selectedRows = [];
    const selectedColumns = [];

    selected.forEach((cell) => {

        selectedRows.push(Number(cell.dataset.row));
        selectedColumns.push(Number(cell.dataset.column));
    });

    return {
        startRow: Math.min(...selectedRows),
        startColumn: Math.min(...selectedColumns),
        endRow: Math.max(...selectedRows),
        endColumn: Math.max(...selectedColumns)
    };
}


function clearSelection() {

    cells.forEach((cell) => {
        cell.classList.remove("selected");
    });
}