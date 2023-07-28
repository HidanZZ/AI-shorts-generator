import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
export const apiKeysPath = process.env.DATA_PATH
	? `${process.env.DATA_PATH}/keys.json`
	: "./data/keys.json";
export const assetsPath = process.env.DATA_PATH
	? `${process.env.DATA_PATH}/assets.json`
	: "./data/assets.json";
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

export function checkFolderExist() {
	console.log("datya", process.env.DATA_PATH);

	if (process.env.DATA_PATH) {
		if (!fs.existsSync(process.env.DATA_PATH)) {
			console.log("datyhe");

			fs.mkdirSync(process.env.DATA_PATH);
		}
	}
}

export const isUrlYoutube = (url: string) => {
	const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
	return regex.test(url);
};
