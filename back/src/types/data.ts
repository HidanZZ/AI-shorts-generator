import { API_KEYS } from "../constants/keys";

export type AssetFile = {
	assets: Asset[];
};

export type Asset = {
	id: number;
	name: string;
	url: string;
	downloadedPath?: string;
};

export type ApiKeys = API_KEYS.ELEVENLABS | API_KEYS.OPENAI;
