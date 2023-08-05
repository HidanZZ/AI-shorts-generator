import { IAsset, Asset } from "../models/assets";

async function addAssetService(name: string, url: string) {
	const asset = new Asset({ name, url });
	await asset.save();
	return asset;
}

async function deleteAssetService(id: string) {
	const asset = await Asset.findByIdAndDelete(id);
	return asset;
}

async function getAssetByIdService(id: string): Promise<IAsset> {
	const asset = await Asset.findById(id);
	return asset!;
}

async function updateAsset(asset: IAsset) {
	const updated = Asset.findByIdAndUpdate(asset.id, asset);
	return updated;
}

async function getAssetsService() {
	const assets = await Asset.find();
	return assets;
}

export const assetsService = {
	addAssetService,
	deleteAssetService,
	getAssetByIdService,
	updateAsset,
	getAssetsService,
};
