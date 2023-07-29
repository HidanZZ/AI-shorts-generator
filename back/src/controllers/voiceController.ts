// controllers/voiceController.ts
import { Request, Response } from "express";
import { getVoices } from "../lib/elevenLabsApi";
import { checkApiKeyExists } from "../utils/dataFileUtils";

export async function getVoicesController(req: Request, res: Response) {
	const apiKey = checkApiKeyExists();
	if (!apiKey) {
		return res.status(404).json({ message: "no api key found" });
	}
	try {
		const voices = await getVoices(apiKey);
		return res.json(voices);
	} catch (error: any) {
		if (error.response) {
			return res.status(error.response.status).json({
				message: error.response.data.message,
			});
		} else {
			return res.status(500).json({
				message: "an error has occurred, please try later",
			});
		}
	}
}
