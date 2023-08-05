import { cat } from "shelljs";
import { assetsService } from "../services/assetsService";
import { Request, Response } from "express";
import { isUrlYoutube } from "../utils";

export const getAssets = async (req: Request, res: Response) => {
	try {
		const assets = await assetsService.getAssetsService();
		return res.json(assets);
	} catch (err) {
		return res.status(404).json({ message: "no assets found" });
	}
};

export const addAsset = async (req: Request, res: Response) => {
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
		await assetsService.addAssetService(name, url);
		return res.json({ message: "ok" });
	} catch (err) {
		return res.status(500).json({ message: "error while saving asset" });
	}
};

export const deleteAsset = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: "missing key ['id']" });
	}

	try {
		await assetsService.deleteAssetService(id);
		return res.json({ message: "ok" });
	} catch (err) {
		res.status(500).json({ message: "error while saving asset" });
	}
};

export const getAssetById = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: "missing key ['id']" });
	}

	try {
		const asset = await assetsService.getAssetByIdService(id);
		return res.json(asset);
	} catch (err) {
		res.status(404).json({ message: "no asset found" });
	}
};

export const updateAsset = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { name, url } = req.body;

	if (!id) {
		return res.status(400).json({ message: "missing key ['id']" });
	}

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
		const asset = await assetsService.getAssetByIdService(id);
		asset.name = name;
		asset.url = url;
		await assetsService.updateAsset(asset);
		return res.json({ message: "ok" });
	} catch (err) {
		res.status(404).json({ message: "no asset found" });
	}
};
