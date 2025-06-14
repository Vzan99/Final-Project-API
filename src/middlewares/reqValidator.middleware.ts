import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export default function ReqValidator(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        console.error("Zod validation error:", details);
        res.status(422).json({ message: "Validation failed", details });
      }

      next(err);
    }
  };
}
