
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import type { ZodType } from "zod";

export function validateRequest(schema: ZodType) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

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

    const validatedData = result.data as {
      body?: Request["body"];
    };

    if (validatedData.body !== undefined) {
      req.body = validatedData.body;
    }

    return next();
  };
}
