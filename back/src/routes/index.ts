import assetsRouter from "./assetsRoute";
import voiceRouter from "./voiceRoute";
import jobRouter from "./jobRoute";
import keysRoute from "./keysRoute";
import { Router } from "express";

const router = Router();

router.use("/", voiceRouter);
router.use("/", jobRouter);
router.use("/", assetsRouter);
router.use("/", keysRoute);
router.get("/", (req, res) => {
	res.send("Hello World!");
});

export default router;
