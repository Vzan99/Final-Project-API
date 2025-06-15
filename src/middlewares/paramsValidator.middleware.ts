import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export default function ParamsValidator(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
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
