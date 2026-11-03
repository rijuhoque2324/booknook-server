
import type { Request, Response, NextFunction } from "express";
import {
  createRemoteJWKSet,
  jwtVerify,
  decodeJwt,
} from "jose";

// Extend Express Request type
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

// Environment variables
const JWKS_URL = process.env.JWT_JWKS_URL;
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

// Validate environment configuration
if (!JWKS_URL || !JWT_ISSUER || !JWT_AUDIENCE) {
  throw new Error(
    "Missing JWT environment variables: JWT_JWKS_URL, JWT_ISSUER, JWT_AUDIENCE"
  );
}

// Create remote JWKS
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

// Authentication middleware
export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const token = authHeader.slice(7).trim();

    // Diagnostic only: decoded claims are NOT trusted until jwtVerify succeeds.
    const unverifiedPayload = decodeJwt(token);

    console.log("JWT DIAGNOSTICS:", {
    tokenIssuer: unverifiedPayload.iss,
    tokenAudience: unverifiedPayload.aud,
    tokenSubject: unverifiedPayload.sub,
    tokenExpiry: unverifiedPayload.exp
        ? new Date(unverifiedPayload.exp * 1000).toISOString()
        : null,

    expectedIssuer: JWT_ISSUER,
    expectedAudience: JWT_AUDIENCE,
    });

    // Actual cryptographic verification
    const { payload } = await jwtVerify(token, JWKS, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    });

    console.log("JWT VERIFIED:", {
    id: payload.sub,
    email: payload.email,
    });
    // Validate required user claims
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      console.error("JWT missing required claims:", {
        hasSub: typeof payload.sub === "string",
        hasEmail: typeof payload.email === "string",
      });

      return res.status(401).json({
        success: false,
        message: "Required user information is missing from token.",
      });
    }

    // Attach authenticated user to Express request
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
        console.error("JWT ERROR NAME:", error instanceof Error ? error.name : error);
        console.error("JWT ERROR MESSAGE:", error instanceof Error ? error.message : error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token.",
        });
    }
}
