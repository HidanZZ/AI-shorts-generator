import assetsRouter from "./assetsRoute";
import voiceRouter from "./voiceRoute";
import jobRouter from "./jobRoute";
import keysRoute from "./keysRoute";
import { Router } from "express";
import { openAiService } from "../services/openAiService";
import { ClaudeService } from "../services/claudeAiService";

const router = Router();

router.use("/", voiceRouter);
router.use("/", jobRouter);
router.use("/", assetsRouter);
router.use("/", keysRoute);
router.get("/", (req, res) => {
	res.send("Hello World!");
});
router.post("/test", async (req, res) => {
	const { text } = req.body;
	try {
		const resss = await ClaudeService.createClaudeAiChatCompletion({
			prompt: text,
		});
		res.send(resss);
	} catch (err) {
		res.send(err);
	}
});

export default router;
