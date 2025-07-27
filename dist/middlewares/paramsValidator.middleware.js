"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ParamsValidator;
const zod_1 = require("zod");
function ParamsValidator(schema) {
    return (req, res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const details = err.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                }));
                console.error("Zod validation error (params):", details);
                res.status(422).json({ message: "Validation failed", details });
                return;
            }
            next(err);
        }
    };
}
