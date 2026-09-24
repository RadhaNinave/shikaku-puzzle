import Shikaku from "../models/shukaku.model.js";

export const showHomePage = (req, res) => {
    res.render("index");
};

export const showGamePage = async (req, res) => {
    try {
        const { boardId } = req.params;

        const game = await Shikaku.findById(boardId);

        if (!game) {
            return res.status(404).send("Game not found");
        }

        return res.render("game", {
            game
        });
    } catch (error) {
        console.log("Game page error:", error);

        return res.status(500).send("Something went wrong");
    }
};