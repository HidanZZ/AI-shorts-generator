// controllers/voiceController.ts
import { Request, Response } from "express";
import {
	apiKeysPath,
	assetsPath,
	checkApiKeyExists,
	checkAssetsExists,
	checkFolderExist,
	isUrlYoutube,
} from "../utils/dataFileUtils";
import fs from "fs";
import { AssetFile } from "../types/data";
export async function getApiKey(req: Request, res: Response) {
	const elevenLabsApiKey = checkApiKeyExists();
	if (elevenLabsApiKey) {
		return res.json({ elevenLabsApiKey });
	} else {
		return res.status(404).json({ message: "no api key found" });
	}
}

export async function setApiKey(req: Request, res: Response) {
	const { elevenLabsApiKey } = await req.body;
	if (!elevenLabsApiKey) {
		return res
			.status(400)
			.json({ message: "missing api key ['elevenLabsApiKey']" });
	}

	let data: any = {};
	checkFolderExist();
	console.log("apiKeysPath", apiKeysPath);

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
		return res.json({ message: "ok" });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "error while saving api key" });
	}
}

export async function getAssets(req: Request, res: Response) {
	const assets = checkAssetsExists();

	if (assets) {
		return res.json(assets);
	} else {
		return res.status(404).json({ message: "no assets found" });
	}
}

export async function addAsset(req: Request, res: Response) {
	const { name, url } = await req.body;
	if (!name) {
		return res.status(400).json({ message: "missing key ['name']" });
	}
	if (!url) {
		return res.status(400).json({ message: "missing key ['url']" });
	}
	if (!isUrlYoutube(url)) {
		return res.status(400).json({ message: "url is not a youtube url" });
	}

	let data: AssetFile = { assets: [] };
	checkFolderExist();

	// Check if the file exists
	if (fs.existsSync(assetsPath)) {
		// Read and parse existing data
		const rawData = fs.readFileSync(assetsPath, "utf8");
		data = JSON.parse(rawData);
	}

	// add the new asset
	const newId = data.assets.length + 1;
	data.assets.push({ id: newId, name, url });

	try {
		fs.writeFileSync(assetsPath, JSON.stringify(data), "utf8");
		return res.json({ message: "ok" });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "error while saving asset" });
	}
}

export async function deleteAsset(req: Request, res: Response) {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: "missing key ['id']" });
	}

	let data: AssetFile = { assets: [] };

	// Check if the file exists
	if (fs.existsSync(assetsPath)) {
		// Read and parse existing data
		const rawData = fs.readFileSync(assetsPath, "utf8");
		data = JSON.parse(rawData);
	}

	// remove the asset
	const index = data.assets.findIndex((asset) => asset.id === parseInt(id));
	console.log(index);

	if (index !== -1) {
		data.assets.splice(index, 1);
	}

	try {
		fs.writeFileSync(assetsPath, JSON.stringify(data), "utf8");
		return res.json({ message: "ok" });
	} catch (err) {
		res.status(500).json({ message: "error while saving asset" });
	}
}
