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

export type ApiKeys = API_KEYS.ELEVENLABS | API_KEYS.OPENAI | API_KEYS.CLAUDE;

export type OpenAIModel = "gpt-3.5-turbo" | "gpt-4";

export type JobData = {
	redditQuestion: string | null | undefined;
	redditAnswer: string | null | undefined;
	voice: string;
	video: string;
	useElevenLabs: boolean;
	useRandomVideoTime: boolean;
	useAiGeneratedStory: boolean;
	isYoutube: boolean;
};
