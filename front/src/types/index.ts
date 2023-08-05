import { API_KEYS } from "@/constants/keys";

export type ApiKeys = API_KEYS.ELEVENLABS | API_KEYS.OPENAI;

export type Asset = {
	_id: string;
	name: string;
	url: string;
};

export type Job = {
	redditQuestion: string;
	redditAnswer: string;
	voice: string;
	video: string;
	useElevenLabs: boolean;
	useRandomVideoTime: boolean;
};
