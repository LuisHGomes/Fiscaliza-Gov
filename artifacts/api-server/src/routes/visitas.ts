import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { visitasTable, obrasTable, usuariosTable, naoConformidadesTable, fotosVisitaTable } from "@workspace/db";
import { eq, and, desc, count } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";
import { CreateVisitaBody, GetVisitaParams } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);

type AuthRequest = Request & { auth: AuthPayload };

router.get("/", async (req: AuthRequest, res: Response) => {
  const obraId = req.query.obraId ? Number(req.query.obraId) : undefined;

  const visitas = await db
    .select({
      id: visitasTable.id,
      obraId: visitasTable.obraId,
      obraNome: obrasTable.nome,
      fiscalId: visitasTable.fiscalId,
      fiscalNome: usuariosTable.nome,
      visitadoEm: visitasTable.visitadoEm,
      percentualFisico: visitasTable.percentualFisico,
      totalTrabalhadores: visitasTable.totalTrabalhadores,
      atividadesExecutadas: visitasTable.atividadesExecutadas,
      observacoes: visitasTable.observacoes,
      condicoesClimaticas: visitasTable.condicoesClimaticas,
      gpsLat: visitasTable.gpsLat,
      gpsLng: visitasTable.gpsLng,
      foiCriadoOffline: visitasTable.foiCriadoOffline,
      criadoEm: visitasTable.criadoEm,
    })
    .from(visitasTable)
    .leftJoin(obrasTable, eq(obrasTable.id, visitasTable.obraId))
    .leftJoin(usuariosTable, eq(usuariosTable.id, visitasTable.fiscalId))
    .where(
      and(
        eq(obrasTable.municipioId, req.auth.municipioId),
        obraId ? eq(visitasTable.obraId, obraId) : undefined,
      )
    )
    .orderBy(desc(visitasTable.visitadoEm));

  const result = await Promise.all(
    visitas.map(async (v) => {
      const [totalFotos] = await db.select({ count: count() }).from(fotosVisitaTable).where(eq(fotosVisitaTable.visitaId, v.id));
      const [totalNC] = await db.select({ count: count() }).from(naoConformidadesTable).where(eq(naoConformidadesTable.visitaId, v.id));
      return {
        ...v,
        percentualFisico: Number(v.percentualFisico),
        gpsLat: v.gpsLat ? Number(v.gpsLat) : null,
        gpsLng: v.gpsLng ? Number(v.gpsLng) : null,
        visitadoEm: v.visitadoEm.toISOString(),
        criadoEm: v.criadoEm.toISOString(),
        totalFotos: Number(totalFotos?.count ?? 0),
        totalNaoConformidades: Number(totalNC?.count ?? 0),
      };
    })
  );

  res.json(result);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parse = CreateVisitaBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Dados inválidos" }); return; }

  const [visita] = await db
    .insert(visitasTable)
    .values({
      obraId: parse.data.obraId,
      fiscalId: req.auth.userId,
      percentualFisico: String(parse.data.percentualFisico),
      totalTrabalhadores: parse.data.totalTrabalhadores ?? null,
      atividadesExecutadas: parse.data.atividadesExecutadas ?? null,
      observacoes: parse.data.observacoes ?? null,
      condicoesClimaticas: parse.data.condicoesClimaticas ?? null,
      gpsLat: parse.data.gpsLat ? String(parse.data.gpsLat) : null,
      gpsLng: parse.data.gpsLng ? String(parse.data.gpsLng) : null,
    })
    .returning();

  await db.update(obrasTable)
    .set({ percentualFisicoAtual: String(parse.data.percentualFisico), atualizadoEm: new Date() })
    .where(eq(obrasTable.id, parse.data.obraId));

  res.status(201).json({
    ...visita,
    obraNome: null,
    fiscalNome: null,
    percentualFisico: Number(visita.percentualFisico),
    gpsLat: visita.gpsLat ? Number(visita.gpsLat) : null,
    gpsLng: visita.gpsLng ? Number(visita.gpsLng) : null,
    visitadoEm: visita.visitadoEm.toISOString(),
    criadoEm: visita.criadoEm.toISOString(),
    totalFotos: 0,
    totalNaoConformidades: 0,
  });
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  const parse = GetVisitaParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "ID inválido" }); return; }

  const [visita] = await db
    .select({
      id: visitasTable.id,
      obraId: visitasTable.obraId,
      obraNome: obrasTable.nome,
      fiscalId: visitasTable.fiscalId,
      fiscalNome: usuariosTable.nome,
      visitadoEm: visitasTable.visitadoEm,
      percentualFisico: visitasTable.percentualFisico,
      totalTrabalhadores: visitasTable.totalTrabalhadores,
      atividadesExecutadas: visitasTable.atividadesExecutadas,
      observacoes: visitasTable.observacoes,
      condicoesClimaticas: visitasTable.condicoesClimaticas,
      gpsLat: visitasTable.gpsLat,
      gpsLng: visitasTable.gpsLng,
      foiCriadoOffline: visitasTable.foiCriadoOffline,
      criadoEm: visitasTable.criadoEm,
    })
    .from(visitasTable)
    .leftJoin(obrasTable, eq(obrasTable.id, visitasTable.obraId))
    .leftJoin(usuariosTable, eq(usuariosTable.id, visitasTable.fiscalId))
    .where(eq(visitasTable.id, parse.data.id))
    .limit(1);

  if (!visita) { res.status(404).json({ error: "Visita não encontrada" }); return; }

  const [totalFotos] = await db.select({ count: count() }).from(fotosVisitaTable).where(eq(fotosVisitaTable.visitaId, visita.id));
  const [totalNC] = await db.select({ count: count() }).from(naoConformidadesTable).where(eq(naoConformidadesTable.visitaId, visita.id));

  res.json({
    ...visita,
    percentualFisico: Number(visita.percentualFisico),
    gpsLat: visita.gpsLat ? Number(visita.gpsLat) : null,
    gpsLng: visita.gpsLng ? Number(visita.gpsLng) : null,
    visitadoEm: visita.visitadoEm.toISOString(),
    criadoEm: visita.criadoEm.toISOString(),
    totalFotos: Number(totalFotos?.count ?? 0),
    totalNaoConformidades: Number(totalNC?.count ?? 0),
  });
});

export default router;
