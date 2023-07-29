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
