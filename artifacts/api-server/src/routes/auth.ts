import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usuariosTable, municipiosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken, requireAuth, AuthPayload } from "../middlewares/auth";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
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

  const token = generateToken({
    userId: usuario.id,
    municipioId: usuario.municipioId,
    perfil: usuario.perfil,
  });

  res.json({
    token,
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

router.post("/logout", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export default router;
