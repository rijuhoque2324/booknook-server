import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type ValidationSource = "body" | "params" | "query";

export function validateRequest(
  schema: ZodType,
  source: ValidationSource = "body"
): RequestHandler {
  return (req, res, next) => {
    const input =
      source === "body"
        ? req.body
        : source === "params"
          ? req.params
          : req.query;

    const result = schema.safeParse(input);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (source === "body") {
      req.body = result.data;
    }

    return next();
  };
}