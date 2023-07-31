// controllers/voiceController.ts
import { Request, Response } from "express";
import {
	apiKeysPath,
	checkApiKeyExists,
	checkAssetsExists,
} from "../utils/dataFileUtils";
import fs from "fs";
import { AssetFile } from "../types/data";
import {
	addAssetService,
	deleteAssetService,
	getAssetByIdService,
} from "../services/assetsService";
import { isUrlYoutube } from "../utils";
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

	try {
		await addAssetService(name, url);
		return res.json({ message: "ok" });
	} catch (err) {
		return res.status(500).json({ message: "error while saving asset" });
	}
}

export async function deleteAsset(req: Request, res: Response) {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: "missing key ['id']" });
	}

	try {
		await deleteAssetService(id);
		return res.json({ message: "ok" });
	} catch (err) {
		res.status(500).json({ message: "error while saving asset" });
	}
}

export async function getAssetById(req: Request, res: Response) {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: "missing key ['id']" });
	}

	try {
		const asset = await getAssetByIdService(id);
		return res.json(asset);
	} catch (err) {
		res.status(404).json({ message: "no asset found" });
	}
}
