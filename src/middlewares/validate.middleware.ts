import { ZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodObject, location: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data =
        location === "body"
          ? req.body
          : location === "query"
          ? req.query
          : req.params;

      const parsed = schema.parse(data);

      if (location === "body") req.body = parsed;
      if (location === "query") req.query = parsed as any;
      if (location === "params") req.params = parsed as any;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Validation errors",
          errors: err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  };
