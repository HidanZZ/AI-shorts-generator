//claude.ts
import { keysService } from "./keysService";
import { API_KEYS } from "../constants/keys";

let claude: any | null = null;

async function getClaudeApi() {
	if (claude) return claude;
	console.log("creating claude instance");

	let sessionKey = await keysService.getKey(API_KEYS.CLAUDE);
	if (!sessionKey) {
		throw new Error("Unable to retrieve claude session Key");
	}

	const { Claude } = await import("claude-ai");

	claude = new Claude({
		sessionKey: sessionKey,
	});

	return claude;
}

async function createClaudeAiChatCompletion({ prompt }: { prompt: string }) {
	const claudeInstance = await getClaudeApi();
	await claudeInstance.init();
	try {
		const conversation: string = await new Promise((resolve, reject) => {
			try {
				claudeInstance.startConversation(prompt, {
					done(a: any) {
						resolve(a.completion);
					},
				});
			} catch (e) {
				reject(e);
			}
		});
		if (!conversation) throw new Error("No response from claude");
		return conversation;
	} catch (err: any) {
		claude = null;
		throw new Error(err);
	}
}

export const ClaudeService = {
	createClaudeAiChatCompletion,
};
