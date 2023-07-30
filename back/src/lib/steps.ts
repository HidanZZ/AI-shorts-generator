import { checkApiKeyExists } from "../utils/dataFileUtils";
import { textToSpeech } from "./elevenLabsApi";
import fs from "fs";
import os from "os";
import path from "path";
//@ts-ignore --- NEEDS TYPES :(!
import { whisper } from "whisper-node";

export async function getAudio(text: string, voiceId: string) {
	const apiKey = checkApiKeyExists();
	if (!apiKey) {
		throw new Error("no api key found");
	}
	try {
		const audioData = await textToSpeech(apiKey, text, voiceId);
		const timestamp = Date.now();
		const tempFilePath = path.join(os.tmpdir(), "audio-" + timestamp + ".mp3");
		fs.writeFileSync(tempFilePath, audioData, "binary");
		return tempFilePath;
	} catch (err) {
		throw err;
	}
}

export async function getAudioTransciption(audiopath: string) {
	if (!process.env.MODEL_PATH) throw new Error("no model path found");
	const modelPath = path.join(__dirname, "..", "..", process.env.MODEL_PATH);
	console.log("modelPath", modelPath);

	const options = {
		modelPath: modelPath,
	};
	const transcription = await whisper(audiopath, options);
	return transcription;
}
