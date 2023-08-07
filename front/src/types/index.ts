import { API_KEYS } from "@/constants/keys";

export type ApiKeys = API_KEYS.ELEVENLABS | API_KEYS.OPENAI | API_KEYS.CLAUDE;

export type Asset = {
	_id: string;
	name: string;
	url: string;
};

export type Job = {
	redditQuestion: string | undefined;
	redditAnswer: string | undefined;
	voice: string;
	video: string;
	useElevenLabs: boolean;
	useRandomVideoTime: boolean;
	useAiGeneratedStory: boolean;
	isYoutube: boolean;
};
