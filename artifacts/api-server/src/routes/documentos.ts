import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { documentosTable, obrasTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";
import { CreateDocumentoBody } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);
type AuthRequest = Request & { auth: AuthPayload };

router.get("/", async (req: AuthRequest, res: Response) => {
  const { obraId, categoria } = req.query as Record<string, string>;

  const docs = await db
    .select({
      id: documentosTable.id,
      obraId: documentosTable.obraId,
      categoria: documentosTable.categoria,
      nome: documentosTable.nome,
      fileUrl: documentosTable.fileUrl,
      versao: documentosTable.versao,
      assinado: documentosTable.assinado,
      expiracaoEm: documentosTable.expiracaoEm,
      criadoEm: documentosTable.criadoEm,
    })
    .from(documentosTable)
    .leftJoin(obrasTable, eq(obrasTable.id, documentosTable.obraId))
    .where(eq(obrasTable.municipioId, req.auth.municipioId))
    .orderBy(desc(documentosTable.criadoEm));

  let result = docs.map((d) => ({ ...d, criadoEm: d.criadoEm.toISOString() }));
  if (obraId) result = result.filter((d) => d.obraId === Number(obraId));
  if (categoria) result = result.filter((d) => d.categoria === categoria);

  res.json(result);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parse = CreateDocumentoBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Dados inválidos" }); return; }

  const [doc] = await db
    .insert(documentosTable)
    .values({
      obraId: parse.data.obraId,
      categoria: parse.data.categoria,
      nome: parse.data.nome,
      fileUrl: parse.data.fileUrl,
      expiracaoEm: parse.data.expiracaoEm ?? null,
    })
    .returning();

  res.status(201).json({ ...doc, criadoEm: doc.criadoEm.toISOString() });
});

export default router;
