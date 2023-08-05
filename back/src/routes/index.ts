import assetsRouter from "./assetsRoute";
import voiceRouter from "./voiceRoute";
import jobRouter from "./jobRoute";
import keysRoute from "./keysRoute";
import { Router } from "express";
import { openAiService } from "../services/openAiService";

const router = Router();

router.use("/", voiceRouter);
router.use("/", jobRouter);
router.use("/", assetsRouter);
router.use("/", keysRoute);
router.get("/", (req, res) => {
	res.send("Hello World!");
});
router.post("/test", async (req, res) => {
	const { system, text, maxTokens, temp } = req.body;
	try {
		const resss = await openAiService.createOpenAIChatCompletion({
			system: system,
			prompt: text,
			model: "gpt-3.5-turbo",
			maxTokens: maxTokens,
			temperature: temp,
		});
		res.send(resss);
	} catch (err) {
		res.send(err);
	}
});

export default router;
