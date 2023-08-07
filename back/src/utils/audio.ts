import asyncShell from ".";

import path from "path";
import { tempDir } from "../constants/processingPath";
// run this command edge-tts --text "{text}" --write-media {output_file}
export const textToSpeech = async (
	text: string,
	output_file: string,
	voice: string = "en-CA-LiamNeural"
): Promise<{ audio: string; subtitles: string }> => {
	voice = "en-CA-LiamNeural";
	// voice = 'en-GB-RyanNeural'
	// voice = 'en-US-ChristopherNeural'

	const tempAudioPath = path.join(tempDir, `${output_file}.mp3`);
	const tempSubtitlesPath = path.join(tempDir, `${output_file}.vtt`);
	const command = `edge-tts --voice ${voice}  --text "${text}" --write-media ${tempAudioPath} --words-in-cue 1 --write-subtitles ${tempSubtitlesPath} --rate "+5%"`;
	await asyncShell(command);
	return {
		audio: tempAudioPath,
		subtitles: tempSubtitlesPath,
	};
};

export async function whisperTranscribe(audioPath: string) {
	const command = `whisper_timestamped ${audioPath} --model small.en -f vtt --output_dir ${path.dirname(
		audioPath
	)}`;
	console.log("[whisperTranscribe] command", command);

	await asyncShell(command);
	const subtitlesPath = audioPath + ".words.vtt";
	console.log("[whisperTranscribe] subtitlesPath", subtitlesPath);

	return subtitlesPath;
}
