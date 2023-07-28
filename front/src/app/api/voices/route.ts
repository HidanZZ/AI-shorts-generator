import { NextResponse } from "next/server";
const elevenLabsAPI = "https://api.elevenlabs.io/v1";
import axios from "axios";
import { checkApiKeyExists } from "../config/apikeys/route";

export async function GET() {
	const apiKey = checkApiKeyExists();
	if (!apiKey) {
		return NextResponse.json({ message: "no api key found" }, { status: 404 });
	}
	try {
		const voices = await getVoices(apiKey);
		return NextResponse.json(voices);
	} catch (error: any) {
		if (error.response) {
			return NextResponse.json(
				{ message: error.response.data.message },
				{ status: error.response.status }
			);
		} else {
			return NextResponse.json(
				{ message: "an error has occured, please try later" },
				{ status: 500 }
			);
		}
	}
}

const getVoices = async (apiKey: string) => {
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
};
