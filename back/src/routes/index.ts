import settingsRouter from "./settingsRoute";
import voiceRouter from "./voiceRoute";
import jobRouter from "./jobRoute";
import { Router } from "express";

const router = Router();

router.use("/", voiceRouter);
router.use("/", settingsRouter);
router.use("/", jobRouter);

export default router;
