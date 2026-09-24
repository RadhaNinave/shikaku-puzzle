import Joi from "joi";
import mongoose from "mongoose";
export const createShikakuSchema = Joi.object({
    rows: Joi.number()
        .integer()
        .min(1)
        .required(),

    columns: Joi.number()
        .integer()
        .min(1)
        .required()
});

export const selectRectangleSchema = Joi.object({
    startRow: Joi.number()
        .integer()
        .min(0)
        .required(),

    startColumn: Joi.number()
        .integer()
        .min(0)
        .required(),

    endRow: Joi.number()
        .integer()
        .min(0)
        .required(),

    endColumn: Joi.number()
        .integer()
        .min(0)
        .required()
});

export const lockRectangleSchema = Joi.object({
    startRow: Joi.number()
        .integer()
        .min(0)
        .required(),

    startColumn: Joi.number()
        .integer()
        .min(0)
        .required(),

    endRow: Joi.number()
        .integer()
        .min(0)
        .required(),

    endColumn: Joi.number()
        .integer()
        .min(0)
        .required()
});
export const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};