import { NextResponse } from "next/server";
import fs from "fs";
const apiKeysPath = "./data/apiKeys.json";

export async function POST(req: Request) {
	const { elevenLabsApiKey } = await req.json();
	if (!elevenLabsApiKey) {
		return NextResponse.json(
			{ message: "missing api key ['elevenLabsApiKey']" },

			{ status: 400 }
		);
	}
	checkDataFolderExist();

	let data: any = {};

	// Check if the file exists
	if (fs.existsSync(apiKeysPath)) {
		// Read and parse existing data
		const rawData = fs.readFileSync(apiKeysPath, "utf8");
		data = JSON.parse(rawData);
	}

	// Update the 'elevenLabsApiKey' property
	data["elevenLabsApiKey"] = elevenLabsApiKey;

	try {
		fs.writeFileSync(apiKeysPath, JSON.stringify(data), "utf8");
		return NextResponse.json({ message: "ok" });
	} catch (err) {
		console.log(err);
		return NextResponse.json(
			{ message: "error while saving api key" },
			{ status: 500 }
		);
	}
}
function checkDataFolderExist() {
	if (!fs.existsSync("./data")) {
		fs.mkdirSync("./data");
	}
}

export async function GET() {
	// Check if the file exists
	const apiKey = checkApiKeyExists();
	if (apiKey) {
		return NextResponse.json({ elevenLabsApiKey: apiKey });
	} else {
		return NextResponse.json({ message: "no api key found" }, { status: 404 });
	}
}

export const checkApiKeyExists = () => {
	// Check if the file exists
	if (fs.existsSync(apiKeysPath)) {
		const data = fs.readFileSync(apiKeysPath, "utf8");
		return JSON.parse(data)["elevenLabsApiKey"];
	} else {
		return false;
	}
};
