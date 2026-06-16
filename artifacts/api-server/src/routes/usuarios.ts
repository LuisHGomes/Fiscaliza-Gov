import { Router } from "express";
import { db } from "@workspace/db";
import { usuariosTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import type { AuthPayload } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

type AuthReq = Request & { auth: AuthPayload };

const updatePerfilSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

const updateSenhaSchema = z.object({
  senhaAtual: z.string(),
  novaSenha: z.string().min(6),
});

router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  const { auth } = req as AuthReq;
  const parsed = updatePerfilSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const [usuario] = await db
    .update(usuariosTable)
    .set(parsed.data)
    .where(eq(usuariosTable.id, auth.userId))
    .returning();

  const municipio = await db.query.municipiosTable?.findFirst?.({
    where: (m: any, { eq: eq2 }: any) => eq2(m.id, auth.municipioId),
  }).catch(() => null);

  res.json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    municipioId: usuario.municipioId,
    municipioNome: (municipio as any)?.nome ?? null,
    avatar: usuario.avatar,
    criadoEm: usuario.criadoEm,
  });
});

router.patch("/me/senha", requireAuth, async (req: Request, res: Response) => {
  const { auth } = req as AuthReq;
  const parsed = updateSenhaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const [usuario] = await db
    .select()
    .from(usuariosTable)
    .where(eq(usuariosTable.id, auth.userId))
    .limit(1);

  if (!usuario) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  const senhaValida = await bcrypt.compare(parsed.data.senhaAtual, usuario.senhaHash);
  if (!senhaValida) {
    res.status(400).json({ error: "Senha atual incorreta" });
    return;
  }

  const novoHash = await bcrypt.hash(parsed.data.novaSenha, 10);
  await db
    .update(usuariosTable)
    .set({ senhaHash: novoHash })
    .where(eq(usuariosTable.id, auth.userId));

  res.json({ ok: true });
});

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { auth } = req as AuthReq;
  const perfil = auth.perfil;

  if (perfil !== "administrador" && perfil !== "gestor") {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const usuarios = await db
    .select({
      id: usuariosTable.id,
      nome: usuariosTable.nome,
      email: usuariosTable.email,
      perfil: usuariosTable.perfil,
      municipioId: usuariosTable.municipioId,
      avatar: usuariosTable.avatar,
      criadoEm: usuariosTable.criadoEm,
    })
    .from(usuariosTable)
    .where(and(
      eq(usuariosTable.municipioId, auth.municipioId),
      eq(usuariosTable.ativo, "true")
    ));

  res.json(usuarios.map(u => ({ ...u, municipioNome: null })));
});

export default router;
