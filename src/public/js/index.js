const gameForm = document.getElementById("gameForm");
const errorElement = document.getElementById("error");

gameForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const rows = Number(document.getElementById("rows").value);
    const columns = Number(document.getElementById("columns").value);

    try {
        const response = await fetch("/shikaku/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rows,
                columns
            })
        });

        const result = await response.json();

        if (!response.ok) {
            errorElement.textContent = result.message;
            return;
        }

        const boardId = result.data._id;

        const rectangleResponse = await fetch(
            `/shikaku/rectangles/${boardId}`,
            {
                method: "POST"
            }
        );

        const rectangleResult = await rectangleResponse.json();

        if (!rectangleResponse.ok) {
            errorElement.textContent = rectangleResult.message;
            return;
        }

        console.log("Rectangles generated:", rectangleResult);

        window.location.href = `/game/${boardId}`;

    } catch (error) {
        console.log(error);
        errorElement.textContent = "Something went wrong";
    }
});