import { openAiService } from "../services/openAiService";
import { prompts } from "../constants/prompts";

async function fixGrammar(text: string) {
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

async function generateRedditAnswer(question: string) {
	const response = await openAiService.createOpenAIChatCompletion({
		system: prompts.GenerateRedditAnswerPrompt.system,
		prompt: prompts.GenerateRedditAnswerPrompt.text.replace(
			"<<QUESTION>>",
			question
		),
		model: "gpt-3.5-turbo",
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
	return result;
}

export const TextProcessing = {
	fixGrammar,
	generateRedditQuestion,
	generateRedditAnswer,
	judgeRedditAnswer,
};
