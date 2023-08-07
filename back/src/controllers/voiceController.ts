// controllers/voiceController.ts
import { Request, Response } from "express";
import { getVoices } from "../lib/elevenLabsApi";
import { textToSpeech } from "../utils/audio";
import { keysService } from "../services/keysService";
import { API_KEYS } from "../constants/keys";

export async function getVoicesController(req: Request, res: Response) {
	const apiKey = await keysService.getKey(API_KEYS.ELEVENLABS);
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

export async function textToSpeechController(req: Request, res: Response) {
	const { text, voice, output_file } = req.body;
	if (!text || !voice) {
		return res.status(400).json({ message: "missing parameters" });
	}
	try {
		const audio = await textToSpeech(output_file, text, voice);
		return res.json({ audio });
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
