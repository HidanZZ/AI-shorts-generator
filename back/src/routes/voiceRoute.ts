// routes/voiceRoutes.ts

import { Router } from "express";
import { getVoicesController } from "../controllers/voiceController";
import { redditQuestionImage } from "../utils/image";
const voiceRouter = Router();

voiceRouter.get("/voices", getVoicesController);
voiceRouter.post("/text-to-speech", getVoicesController);
voiceRouter.post("/generate-image", (req, res) => {
	const { text, output_file } = req.body;
	let imageBuffer = redditQuestionImage(text, output_file);
	res.writeHead(200, {
		"Content-Type": "image/png",
	});

	res.end(imageBuffer);
});

export default voiceRouter;
