import asyncShell from ".";
import os from "os";
import path from "path";
// run this command edge-tts --text "{text}" --write-media {output_file}
export const textToSpeech = async (
	text: string,
	output_file: string,
	voice: string = "en-US-ChristopherNeural"
): Promise<{ audio: string; subtitles: string }> => {
	const tempAudioPath = path.join(os.tmpdir(), `${output_file}.mp3`);
	const tempSubtitlesPath = path.join(os.tmpdir(), `${output_file}.vtt`);
	const command = `edge-tts --voice en-US-ChristopherNeural  --text "${text}" --write-media ${tempAudioPath} --words-in-cue 1 --write-subtitles ${tempSubtitlesPath} --rate "+5%"`;
	console.log(command);

	await asyncShell(command);
	return {
		audio: tempAudioPath,
		subtitles: tempSubtitlesPath,
	};
};
