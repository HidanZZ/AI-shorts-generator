import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { keysService } from "./keysService";
import { API_KEYS } from "../constants/keys";
import { OpenAIModel } from "../types/data";

let openai: OpenAIApi | null = null;

async function getOpenAIApi() {
	if (openai) return openai;
	console.log("creating openai instance");

	let apiKey = await keysService.getKey(API_KEYS.OPENAI);
	if (!apiKey) {
		throw new Error("Unable to retrieve OpenAI API Key");
	}

	const configuration = new Configuration({ apiKey });
	openai = new OpenAIApi(configuration);

	return openai;
}

async function createOpenAIChatCompletion({
	system = "You are an AI that can give the answer to anything",
	prompt,
	model,
	maxTokens = 1000,
	temperature = 0.7,
}: {
	system?: string;
	prompt: string;
	model: OpenAIModel;
	maxTokens?: number;
	temperature?: number;
}) {
	const openaiInstance = await getOpenAIApi();
	const messages: ChatCompletionRequestMessage[] = [
		{ role: "system", content: system },
		{ role: "user", content: prompt },
	];
	console.log("messages", messages);

	try {
		const chatCompletion = await openaiInstance.createChatCompletion({
			model: model,
			messages: messages,
			max_tokens: maxTokens,
			temperature: temperature,
		});
		const response = chatCompletion.data.choices[0].message;
		if (!response) throw new Error("No response from openai");
		return response;
	} catch (err: any) {
		openai = null;
		throw new Error(err);
	}
}

export const openAiService = {
	createOpenAIChatCompletion,
};
