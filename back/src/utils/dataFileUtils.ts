import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import os from "os";
dotenv.config();
export const apiKeysPath = path.join(os.homedir(), "apiKeys.json");
export const assetsPath = path.join(os.homedir(), "assets.json");
export function checkApiKeyExists() {
	// Check if the file exists
	if (fs.existsSync(apiKeysPath)) {
		const data = fs.readFileSync(apiKeysPath, "utf8");
		return JSON.parse(data)["elevenLabsApiKey"];
	} else {
		return false;
	}
}
export const checkAssetsExists = () => {
	// Check if the file exists
	if (fs.existsSync(assetsPath)) {
		const data = fs.readFileSync(assetsPath, "utf8");
		return JSON.parse(data);
	} else {
		return false;
	}
};

export const isUrlYoutube = (url: string) => {
	const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
	return regex.test(url);
};
