export function validateRequest(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("\n========== BOOK VALIDATION DEBUG ==========");
    console.log("METHOD:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("CONTENT TYPE:", req.headers["content-type"]);
    console.log("REQUEST BODY:", JSON.stringify(req.body, null, 2));
    console.log("BODY KEYS:", Object.keys(req.body || {}));

    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.error(
        "ZOD ERRORS:",
        JSON.stringify(result.error.issues, null, 2)
      );

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.body = result.data;
    console.log("VALIDATION SUCCESS");
    console.log("===========================================\n");

    return next();
  };
}