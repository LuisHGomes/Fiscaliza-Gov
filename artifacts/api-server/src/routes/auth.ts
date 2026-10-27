import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usuariosTable, municipiosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken, generateRefreshToken, requireAuth, AuthPayload, JWT_REFRESH_SECRET } from "../middlewares/auth";
import { LoginBody } from "@workspace/api-zod";
import { authLimiter } from "../middlewares/rateLimit";
import crypto from "crypto";
import {
  generateSecret,
  generateURI,
  verify,
} from "otplib";

const router = Router();

router.post("/login", authLimiter, async (req: Request, res: Response) => {
  const parse = LoginBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }
  const { email, senha } = parse.data;

  const [usuario] = await db
    .select({
      id: usuariosTable.id,
      nome: usuariosTable.nome,
      email: usuariosTable.email,
      perfil: usuariosTable.perfil,
      senhaHash: usuariosTable.senhaHash,
      avatar: usuariosTable.avatar,
      municipioId: usuariosTable.municipioId,
      criadoEm: usuariosTable.criadoEm,
    })
    .from(usuariosTable)
    .where(eq(usuariosTable.email, email))
    .limit(1);

  if (!usuario) {
    res.status(401).json({ error: "Email ou senha incorretos" });
    return;
  }

  const senhaOk = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaOk) {
    res.status(401).json({ error: "Email ou senha incorretos" });
    return;
  }

  const [municipio] = await db
    .select({ nome: municipiosTable.nome })
    .from(municipiosTable)
    .where(eq(municipiosTable.id, usuario.municipioId))
    .limit(1);

  const accessToken = generateToken({
    userId: usuario.id,
    municipioId: usuario.municipioId,
    perfil: usuario.perfil,
  });

  const refreshToken = generateRefreshToken({
    userId: usuario.id,
    municipioId: usuario.municipioId,
    perfil: usuario.perfil,
  });

  res.json({
    accessToken,
    refreshToken,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      municipioId: usuario.municipioId,
      municipioNome: municipio?.nome ?? null,
      avatar: usuario.avatar ?? null,
      criadoEm: usuario.criadoEm.toISOString(),
    },
  });
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const auth = (req as Request & { auth: AuthPayload }).auth;

  const [usuario] = await db
    .select({
      id: usuariosTable.id,
      nome: usuariosTable.nome,
      email: usuariosTable.email,
      perfil: usuariosTable.perfil,
      avatar: usuariosTable.avatar,
      municipioId: usuariosTable.municipioId,
      criadoEm: usuariosTable.criadoEm,
    })
    .from(usuariosTable)
    .where(eq(usuariosTable.id, auth.userId))
    .limit(1);

  if (!usuario) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  const [municipio] = await db
    .select({ nome: municipiosTable.nome })
    .from(municipiosTable)
    .where(eq(municipiosTable.id, usuario.municipioId))
    .limit(1);

  res.json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    municipioId: usuario.municipioId,
    municipioNome: municipio?.nome ?? null,
    avatar: usuario.avatar ?? null,
    criadoEm: usuario.criadoEm.toISOString(),
  });
});

router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    res.status(400).json({ error: "refreshToken é obrigatório" });
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthPayload;

    const accessToken = generateToken({
      userId: payload.userId,
      municipioId: payload.municipioId,
      perfil: payload.perfil,
    });

    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: "Refresh token inválido ou expirado" });
  }
});

router.post("/mfa/setup", requireAuth, async (req: Request, res: Response) => {
  const auth = (req as Request & { auth: AuthPayload }).auth;

  const secret = generateSecret();
  const qrCode = generateURI({
    strategy: "totp",
    issuer: "Fiscaliza-Gov",
    label: auth.userId.toString(),
    secret,
  });

  res.json({
    secret,
    qrCode,
    provisioningUri: qrCode,
  });
});

router.post("/mfa/verify", requireAuth, async (req: Request, res: Response) => {
  const auth = (req as Request & { auth: AuthPayload }).auth;
  const { token } = req.body as { token?: string };

  if (!token) {
    res.status(400).json({ error: "Token de verificação é obrigatório" });
    return;
  }

  const verified = verify({ token, secret: auth.totpSecret ?? "" });

  if (!verified) {
    res.status(401).json({ error: "Token de MFA inválido" });
    return;
  }

  const [usuario] = await db
    .update(usuariosTable)
    .set({ mfaAtivo: "true" })
    .where(eq(usuariosTable.id, auth.userId))
    .returning();

  res.json({
    mfaAtivo: usuario?.mfaAtivo === "true",
  });
});

router.post("/logout", async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  res.json({ ok: true });
});

export default router;
