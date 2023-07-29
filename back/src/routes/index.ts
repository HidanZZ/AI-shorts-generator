import settingsRouter from "./settingsRoute";
import voiceRouter from "./voiceRoute";
import { Router } from "express";

const router = Router();

router.use("/", voiceRouter);
router.use("/", settingsRouter);

export default router;
