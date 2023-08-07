import { keysService } from "../services/keysService";
import { Request, Response } from "express";
import { ApiKeys } from "../types/data";
import { API_KEYS } from "../constants";

export async function getApiKey(req: Request, res: Response) {
	const { key } = req.params;

	if (!key) {
		return res.status(400).json({ message: "missing key ['key']" });
	}
	//check if key is of type ApiKeys
	if (!Object.values(API_KEYS).includes(key as ApiKeys)) {
		return res.status(400).json({ message: "key is not of type ApiKeys" });
	}

	try {
		const apiKey = await keysService.getKey(key as ApiKeys);
		return res.json(apiKey);
	} catch (err) {
		res.status(404).json({ message: "no key found" });
	}
}

export async function getApiKeys(req: Request, res: Response) {
	try {
		const apiKeys = await keysService.getKeys();
		return res.json(apiKeys);
	} catch (err) {
		res.status(404).json({ message: "no keys found" });
	}
}

export async function addApiKey(req: Request, res: Response) {
	const { key, value } = await req.body;
	if (!key) {
		return res.status(400).json({ message: "missing key ['key']" });
	}
	if (!value) {
		return res.status(400).json({ message: "missing key ['value']" });
	}
	if (!Object.values(API_KEYS).includes(key as ApiKeys)) {
		return res.status(400).json({ message: "key is not of type ApiKeys" });
	}

	try {
		await keysService.addKey(key as ApiKeys, value);
		return res.json({ message: "ok" });
	} catch (err) {
		return res.status(500).json({ message: "error while saving key" });
	}
}
