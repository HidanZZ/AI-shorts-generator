import settingsRouter from "./settingsRoute";
import voiceRouter from "./voiceRoute";
import jobRouter from "./jobRoute";
import { Router } from "express";

const router = Router();

router.use("/", voiceRouter);
router.use("/", settingsRouter);
router.use("/", jobRouter);
router.get("/", (req, res) => {
	res.send("Hello World!");
});

export default router;
