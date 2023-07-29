import axios from "axios";
const elevenLabsAPI = "https://api.elevenlabs.io/v1";

export async function getVoices(apiKey: string) {
	try {
		if (!apiKey) {
			console.log("ERR: Missing parameter");
		}

		const voiceURL = `${elevenLabsAPI}/voices`;

		const response = await axios({
			method: "GET",
			url: voiceURL,
			headers: {
				"xi-api-key": apiKey,
			},
		});

		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function textToSpeech(
	apiKey: string,
	text: string,
	voiceId: string
) {
	try {
		if (!apiKey) {
			console.log("ERR: Missing parameter");
		}

		const voiceURL = `${elevenLabsAPI}/text-to-speech/${voiceId}`;

		const response = await axios({
			method: "POST",
			url: voiceURL,
			headers: {
				"xi-api-key": apiKey,
				accept: "audio/mpeg",
				"Content-Type": "application/json",
			},
			data: {
				text,
				voice_settings: {
					stability: 0.5,
					similarity_boost: 0.5,
				},
			},
			responseType: "arraybuffer",
		});

		return response.data;
	} catch (error) {
		throw error;
	}
}
