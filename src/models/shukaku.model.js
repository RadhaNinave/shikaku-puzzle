import mongoose from "mongoose";

const shikakuSchema = new mongoose.Schema(
    {
        rows: {
            type: Number,
            required: true
        },

        columns: {
            type: Number,
            required: true
        },

        rectangles: {
            type: Array,
            default: []
        },

        status: {
            type: String,
            default: "playing"
        },

        startTime: {
            type: Date,
            default: Date.now
        },

        endTime: {
            type: Date,
            default: null
        },

        totalTime: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Shikaku = mongoose.model("Shikaku", shikakuSchema);

export default Shikaku;