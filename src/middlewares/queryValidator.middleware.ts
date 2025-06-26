import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export default function QueryValidator(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      (req as any).validatedQuery = validated;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
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
