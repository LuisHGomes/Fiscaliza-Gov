import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import obrasRouter from "./obras";
import visitasRouter from "./visitas";
import naoConformidadesRouter from "./nao_conformidades";
import medicoesRouter from "./medicoes";
import documentosRouter from "./documentos";
import notificacoesRouter from "./notificacoes";
import dashboardRouter from "./dashboard";
import iaRouter from "./ia";
import portalRouter from "./portal";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/obras", obrasRouter);
router.use("/visitas", visitasRouter);
router.use("/nao-conformidades", naoConformidadesRouter);
router.use("/medicoes", medicoesRouter);
router.use("/documentos", documentosRouter);
router.use("/notificacoes", notificacoesRouter);
router.use("/dashboard", dashboardRouter);
router.use("/ia", iaRouter);
router.use("/portal", portalRouter);

export default router;
