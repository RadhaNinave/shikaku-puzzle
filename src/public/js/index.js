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

        console.log(result);

        window.location.href = `/game/${result.data._id}`;

    } catch (error) {
        console.log(error);
        errorElement.textContent = "Something went wrong";
    }
});