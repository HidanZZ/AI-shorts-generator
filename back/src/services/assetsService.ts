import { assetsPath, checkAssetsExists } from "../utils/dataFileUtils";
import fs from "fs";
import { Asset, AssetFile } from "../types/data";

export async function addAssetService(name: string, url: string) {
	let data: AssetFile = { assets: [] };

	// Check if the file exists
	if (fs.existsSync(assetsPath)) {
		// Read and parse existing data
		const rawData = fs.readFileSync(assetsPath, "utf8");
		data = JSON.parse(rawData);
	}

	// add the new asset
	const newId = data.assets.length + 1;
	data.assets.push({ id: newId, name, url });

	fs.writeFileSync(assetsPath, JSON.stringify(data), "utf8");
}

export async function deleteAssetService(id: string) {
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

	fs.writeFileSync(assetsPath, JSON.stringify(data), "utf8");
}

export async function getAssetByIdService(id: string): Promise<Asset> {
	const assets = checkAssetsExists();

	if (assets) {
		const asset = assets.assets.find(
			(asset: Asset) => asset.id === parseInt(id)
		);
		if (asset) {
			return asset;
		} else {
			throw new Error("no asset found");
		}
	} else {
		throw new Error("no assets found");
	}
}
