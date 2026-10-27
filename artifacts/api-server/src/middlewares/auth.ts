import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const JWT_SECRET = process.env.SESSION_SECRET as string;
export const JWT_REFRESH_SECRET = process.env.SESSION_REFRESH_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required but was not provided.");
}
if (!JWT_REFRESH_SECRET) {
  throw new Error("SESSION_REFRESH_SECRET environment variable is required but was not provided.");
}

export interface AuthPayload {
  userId: number;
  municipioId: number;
  perfil: string;
  iat?: number;
  exp?: number;
  totpSecret?: string;
}


export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token de autenticação necessário" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    (req as Request & { auth: AuthPayload }).auth = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}
