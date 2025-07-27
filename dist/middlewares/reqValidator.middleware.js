"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReqValidator;
const zod_1 = require("zod");
function ReqValidator(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const details = err.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                }));
                console.error("Zod validation error:", details);
                res.status(422).json({ message: "Validation failed", details });
                return;
            }
            next(err);
        }
    };
}
