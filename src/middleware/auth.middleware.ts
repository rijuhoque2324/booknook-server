
import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
      };
    }
  }
}

const JWKS_URL = process.env.JWT_JWKS_URL;
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

if (!JWKS_URL || !JWT_ISSUER || !JWT_AUDIENCE) {
  throw new Error("JWT environment variables are missing.");
}

const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is empty.",
      });
    }

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      console.error("JWT payload is missing required claims:", {
        hasSub: typeof payload.sub === "string",
        hasEmail: typeof payload.email === "string",
      });

      return res.status(401).json({
        success: false,
        message: "Required user information is missing from token.",
      });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      name:
        typeof payload.name === "string"
          ? payload.name
          : undefined,
    };

    next();
  } catch (error) {
    console.error("========== JWT VERIFICATION ERROR ==========");

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
    } else {
      console.error(error);
    }

    console.error("=============================================");

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}
