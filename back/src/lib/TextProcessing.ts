import { openAiService } from "../services/openAiService";
import { prompts } from "../constants/prompts";

async function fixGrammar(text: string) {
	console.log("[fixGrammar] text", text);
	const response = await openAiService.createOpenAIChatCompletion({
		system: prompts.FixGrammarPrompt.system,
		prompt: text,
		model: "gpt-3.5-turbo",
		temperature: prompts.FixGrammarPrompt.temp,
	});
	const result = response.content;
	if (!result) throw new Error("No result from openai");
	return result;
}

async function generateRedditQuestion() {
	const response = await openAiService.createOpenAIChatCompletion({
		system: prompts.GenerateRedditQuestionPrompt.system,
		prompt: prompts.GenerateRedditQuestionPrompt.text,
		model: "gpt-3.5-turbo",
		temperature: prompts.GenerateRedditQuestionPrompt.temp,
	});
	const result = response.content;
	if (!result) throw new Error("No result from openai");
	return result;
}

async function generateRedditAnswer(
	question: string,
	isYoutube: boolean = false
) {
	const response = await openAiService.createOpenAIChatCompletion({
		system: prompts.GenerateRedditAnswerPrompt.system,
		prompt: prompts.GenerateRedditAnswerPrompt.text.replace(
			"<<QUESTION>>",
			question
		),
		model: "gpt-3.5-turbo",
		maxTokens: isYoutube ? 210 : 1000,
		temperature: prompts.GenerateRedditAnswerPrompt.temp,
	});
	const result = response.content;
	if (!result) throw new Error("No result from openai");
	return result;
}

async function judgeRedditAnswer(answer: string) {
	const response = await openAiService.createOpenAIChatCompletion({
		system: prompts.redditJudgePrompt.system,
		prompt: prompts.redditJudgePrompt.text.replace("<<INPUT>>", answer),
		model: "gpt-3.5-turbo",
		temperature: prompts.redditJudgePrompt.temp,
	});
	const result = response.content;
	if (!result) throw new Error("No result from openai");
	console.log("judgeRedditAnswer", result);

	return result;
}
async function generateTitleDescriptionDict(
	text: string
): Promise<[string, string]> {
	let out = { title: "", description: "" };

	while (out.title === "" || out.description === "") {
		try {
			const ai_res = await openAiService.createOpenAIChatCompletion({
				system: prompts.youtubeMetadataPrompt.system,
				prompt: text,
				model: "gpt-3.5-turbo",
				temperature: prompts.youtubeMetadataPrompt.temp,
			});
			const result = ai_res.content;
			if (!result) throw new Error("No result from openai");
			let response = JSON.parse(result);
			if ("title" in response) {
				out.title = response.title;
			}
			if ("description" in response) {
				out.description = response.description;
			}
		} catch (e) {
			console.log(e);
		}
	}
	return [out.title, out.description];
}
export const TextProcessing = {
	fixGrammar,
	generateRedditQuestion,
	generateRedditAnswer,
	judgeRedditAnswer,
	generateTitleDescriptionDict,
};
