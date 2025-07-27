"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueryValidator;
const zod_1 = require("zod");
function QueryValidator(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.query);
            req.validatedQuery = validated;
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const details = err.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                }));
                console.error("Zod validation error (query):", details);
                res.status(422).json({ message: "Validation failed", details });
                return;
            }
            next(err);
        }
    };
}
