import { escapeDoubleQuotes } from "../utils";
import { VideoProcessor } from "./VideoProcessor";

export interface IAudioStrategy {
	generateAudio: (
		text: string,
		voice: string,
		subtitles?: boolean
	) => Promise<{
		audio: string;
		subtitles?: string;
	}>;
}
export class ElevenLabsStrategy implements IAudioStrategy {
	private videoProcessor: VideoProcessor;

	constructor(videoProcessor: VideoProcessor) {
		this.videoProcessor = videoProcessor;
	}

	async generateAudio(text: string, voice: string, subtitles: boolean = true) {
		const audioPath = await this.videoProcessor.getAudio(text, voice);
		if (subtitles) {
			const subtitlesPath = await this.videoProcessor.getAudioTransciption(
				audioPath
			);
			console.log("[generateAudio] subtitlesPath", subtitlesPath);

			return { audio: audioPath, subtitles: subtitlesPath };
		} else {
			return { audio: audioPath };
		}
	}
}

export class EdgeTTSStrategy implements IAudioStrategy {
	private videoProcessor: VideoProcessor;

	constructor(videoProcessor: VideoProcessor) {
		this.videoProcessor = videoProcessor;
	}

	async generateAudio(text: string, voice: string, subtitles: boolean = true) {
		const { audio, subtitles: subtitlesPath } =
			await this.videoProcessor.edgeTTS(escapeDoubleQuotes(text), voice);
		return { audio, subtitles: subtitlesPath };
	}
}
