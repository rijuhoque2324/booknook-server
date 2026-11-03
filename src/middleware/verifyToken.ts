import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { ApiError } from "../utils/api-error.js";

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

interface JwtConfig {
  jwks: ReturnType<typeof createRemoteJWKSet>;
  issuer: string;
  audience: string;
}

let cachedConfig: JwtConfig | null = null;

/**
 * Read JWT settings lazily so a missing environment variable only affects
 * protected routes instead of crashing the whole function at import time.
 */
function getJwtConfig(): JwtConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const jwksUrl = process.env.JWT_JWKS_URL;
  const issuer = process.env.JWT_ISSUER;
  const audience = process.env.JWT_AUDIENCE;

  if (!jwksUrl || !issuer || !audience) {
    throw new ApiError(
      500,
      "Authentication is not configured on the server. Set JWT_JWKS_URL, JWT_ISSUER and JWT_AUDIENCE."
    );
  }

  cachedConfig = {
    jwks: createRemoteJWKSet(new URL(jwksUrl)),
    issuer,
    audience,
  };

  return cachedConfig;
}

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { jwks, issuer, audience } = getJwtConfig();

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

    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience,
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
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

    return next();
  } catch (error) {
    // Configuration problems are server errors, not authentication failures.
    if (error instanceof ApiError) {
      return next(error);
    }

    console.error(
      "JWT verification failed:",
      error instanceof Error ? error.message : error
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}
