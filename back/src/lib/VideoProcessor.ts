import { checkApiKeyExists } from "../utils/dataFileUtils";
import { elevenlabsText2Speech } from "./elevenLabsApi";
import fs from "fs";
import os from "os";
import path from "path";
import asyncShell, {
	escapeSingleQuotes,
	toSeconds,
	toTimeString,
} from "../utils";
import ffmpeg from "fluent-ffmpeg";
import { DoneCallback, Job } from "bull";
import { IAudioStrategy } from "./AudioStrategies";
import { copyFile, unlink } from "fs/promises";
import { port } from "..";
import { whisperTranscribe } from "../utils/audio";
const fontPath = path.join(__dirname, "../../fonts/font.otf");

interface IAudioGenerator {
	getAudio: (text: string, voice: string) => Promise<string>;
	getAudioTransciption: (audioPath: string) => Promise<string>;
	edgeTTS: (
		text: string,
		voice: string
	) => Promise<{ audio: string; subtitles: string }>;
}
export type Transcription = {
	start: string;
	end: string;
	speech: string;
};
export abstract class VideoProcessor implements IAudioGenerator {
	protected job: Job<any>;
	protected done: DoneCallback;
	protected voice: string;
	protected video: string;
	protected currentProgress: number = 0;
	protected audioStrategy: IAudioStrategy | undefined;
	protected useRandomVideoTime: boolean = false;

	constructor(job: Job<any>, done: DoneCallback) {
		const { voice, video, useRandomVideoTime } = job.data;
		this.job = job;
		this.voice = voice;
		this.video = video;
		this.useRandomVideoTime = useRandomVideoTime ?? false;
		this.done = done;
	}

	public setAudioStrategy(audioStrategy: IAudioStrategy) {
		this.audioStrategy = audioStrategy;
	}

	protected logger = (message: string) => {
		this.job.progress({ message, progress: this.currentProgress });
	};

	public async getAudio(text: string, voice: string): Promise<string> {
		const apiKey = checkApiKeyExists();
		if (!apiKey) {
			throw new Error("no api key found");
		}
		const audioData = await elevenlabsText2Speech(apiKey, text, voice);
		const timestamp = Date.now();
		const tempFilePath = path.join(os.tmpdir(), "audio-" + timestamp + ".mp3");
		fs.writeFileSync(tempFilePath, audioData, "binary");
		return tempFilePath;
	}

	public async getAudioTransciption(audioPath: string): Promise<string> {
		const transcription = await whisperTranscribe(audioPath);
		return transcription;
	}
	public async edgeTTS(
		text: string,
		voice: string
	): Promise<{ audio: string; subtitles: string }> {
		const timestamp = Date.now();
		const tempAudioPath = path.join(os.tmpdir(), `temp-audio-${timestamp}.mp3`);
		const tempSubtitlesPath = path.join(
			os.tmpdir(),
			`temp-subtitles-${timestamp}.vtt`
		);
		const command = `edge-tts --voice en-US-ChristopherNeural  --text "${text}" --write-media ${tempAudioPath} --words-in-cue 1 --write-subtitles ${tempSubtitlesPath} --rate "+5%"`;
		console.log("command", command);

		await asyncShell(command);
		return {
			audio: tempAudioPath,
			subtitles: tempSubtitlesPath,
		};
	}

	protected async combineAudios(
		audioPath1: string,
		audioPath2: string,
		silenceDuration: number
	): Promise<string> {
		const silencePath = path.join(os.tmpdir(), "silence.m4a");
		const outputPath = path.join(os.tmpdir(), "combined.m4a");
		console.log("combineAudios");

		// Generate silence
		await this.generateSilence(silenceDuration, silencePath);
		console.log("combineAudios2");

		// Combine audios
		return new Promise((resolve, reject) => {
			ffmpeg()
				.input(audioPath1)
				.input(silencePath)
				.input(audioPath2)
				.outputOptions([
					"-filter_complex",
					"[0:a][1:a][2:a]concat=n=3:v=0:a=1[out]",
					"-map",
					"[out]",
				])
				.save(outputPath)
				.on("end", () => {
					resolve(outputPath);
				})
				.on("error", reject)
				.on("progress", (progress) => {
					console.log(`Combining audios: ${progress.percent}%`);
				});
		});
	}

	protected adjustTranscriptionTimes(
		transcriptions: Transcription[],
		timeAdjustment: number
	): Transcription[] {
		return transcriptions.map((transcript) => {
			return {
				start: toTimeString(toSeconds(transcript.start) + timeAdjustment),
				end: toTimeString(toSeconds(transcript.end) + timeAdjustment),
				speech: transcript.speech,
			};
		});
	}
	protected async getDuration(assetPath: string): Promise<number | undefined> {
		return new Promise((resolve, reject) => {
			ffmpeg.ffprobe(assetPath, (err, metadata) => {
				if (err) {
					reject(err);
				} else {
					resolve(metadata.format.duration);
				}
			});
		});
	}
	protected async getRandomeVideoStartTime(
		videoPath: string,
		audioDuration: number | undefined
	): Promise<number> {
		if (!audioDuration) {
			throw new Error("audio duration is undefined");
		}
		const videoDuration = await this.getDuration(videoPath);
		if (!videoDuration) {
			throw new Error("video duration is undefined");
		}
		const maxStartTime = videoDuration - audioDuration;
		const randomStartTime = Math.floor(Math.random() * maxStartTime);
		return randomStartTime;
	}

	// protected async cropVideoToVertical(
	// 	videoPath: string,
	// 	from: number,
	// 	duration: number | undefined
	// ): Promise<void> {
	// 	if (!duration) {
	// 		throw new Error("duration is undefined");
	// 	}
	// 	const tmpPath = videoPath + ".tmp.mp4";
	// 	const totalFrames = await this.getTotalFrames(videoPath);

	// 	let videoDurationInSeconds = await this.getDuration(videoPath);
	// 	let startTime = from;

	// 	// If videoDurationInSeconds is undefined, assume a default value or stop function
	// 	if (videoDurationInSeconds === undefined) {
	// 		videoDurationInSeconds = 0; // Or handle this case as per your requirement
	// 	}

	// 	// If duration is undefined, assume it is the rest of the video

	// 	// Check if from + duration is more than video duration, if so, adjust start time
	// 	if (startTime + duration > videoDurationInSeconds) {
	// 		// Get a random start time that doesn't exceed the duration limit
	// 		startTime = Math.random() * (videoDurationInSeconds - duration);
	// 	}

	// 	return new Promise((resolve, reject) => {
	// 		ffmpeg(videoPath)
	// 			.setStartTime(startTime)
	// 			.setDuration(duration)
	// 			.complexFilter([
	// 				{
	// 					filter: "eq",
	// 					options: { brightness: 1.3 },
	// 				},
	// 			])
	// 			.outputOptions("-vf", "crop=ih*9/16:ih") // Crop to 9:16 ratio
	// 			.save(tmpPath)
	// 			.on("end", () => {
	// 				fs.rename(tmpPath, videoPath, (err) => {
	// 					if (err) reject(err);
	// 					else resolve();
	// 				});
	// 			})
	// 			.on("error", reject)
	// 			.on("progress", (progress) => {
	// 				this.logger(`Cropping video: ${progress.frames} / ${totalFrames}`);
	// 			});
	// 	});
	// }
	protected async cropVideoToVertical(
		videoPath: string,
		from: number,
		duration: number | undefined
	): Promise<void> {
		if (!duration) {
			throw new Error("duration is undefined");
		}
		const tmpPath = videoPath + ".tmp.mp4";
		const totalFrames = await this.getTotalFrames(videoPath);

		let videoDurationInSeconds = await this.getDuration(videoPath);
		let startTime = from;

		// If videoDurationInSeconds is undefined, assume a default value or stop function
		if (videoDurationInSeconds === undefined) {
			videoDurationInSeconds = 0; // Or handle this case as per your requirement
		}

		// If duration is undefined, assume it is the rest of the video

		// Check if from + duration is more than video duration, if so, adjust start time
		if (startTime + duration > videoDurationInSeconds) {
			// Get a random start time that doesn't exceed the duration limit
			startTime = Math.random() * (videoDurationInSeconds - duration);
		}

		return new Promise((resolve, reject) => {
			ffmpeg(videoPath)
				.setStartTime(startTime)
				.setDuration(duration)
				.complexFilter(
					[
						{
							filter: "eq",
							options: { brightness: 0.1 },
							outputs: "brightened",
						},
						{
							filter: "crop",
							options: "ih*9/16:ih",
							inputs: "brightened",
							outputs: "cropped",
						},
					],
					"cropped"
				)
				.save(tmpPath)
				.on("end", () => {
					fs.rename(tmpPath, videoPath, (err) => {
						if (err) reject(err);
						else resolve();
					});
				})
				.on("error", reject)
				.on("progress", (progress) => {
					this.logger(`Cropping video: ${progress.frames} / ${totalFrames}`);
				});
		});
	}

	protected async getTotalFrames(videoPath: string): Promise<any> {
		return new Promise((resolve, reject) => {
			ffmpeg.ffprobe(videoPath, (err, data) => {
				if (err) reject(err);
				else resolve(data.streams[0].nb_frames);
			});
		});
	}
	protected async insertImageInVideo(
		videoPath: string,
		imagePath: string,
		startSeconds: number,
		durationSeconds: number | undefined
	): Promise<void> {
		const tmpPath = videoPath + ".tmp.mp4";
		if (!durationSeconds) {
			throw new Error("durationSeconds is undefined");
		}

		const totalFrames = await this.getTotalFrames(videoPath);

		const imageDimensions = await this.getVideoDimensions(imagePath);
		const videoDimensions = await this.getVideoDimensions(videoPath);

		const overlayX = (videoDimensions.width - imageDimensions.width) / 2;
		const overlayY = (videoDimensions.height - imageDimensions.height) / 2;

		return new Promise((resolve, reject) => {
			ffmpeg()
				.input(videoPath)
				.input(imagePath)
				.complexFilter(
					[
						{
							filter: "overlay",
							options: {
								enable: `between(t,${startSeconds},${
									startSeconds + durationSeconds
								})`,
								x: overlayX,
								y: overlayY,
							},
							outputs: "outv",
						},
					],
					"outv"
				)
				.on("end", () => {
					fs.rename(tmpPath, videoPath, (err) => {
						if (err) reject(err);
						else resolve();
					});
				})
				.on("error", (error) => {
					console.error("Error add image:", error.message);
					reject(error);
				})
				.on("progress", (progress) => {
					this.logger(`Inserting image: ${progress.frames} / ${totalFrames}`);
				})
				.save(tmpPath);
		});
	}

	protected async getVideoDimensions(
		videoPath: string
	): Promise<{ width: any; height: any }> {
		return new Promise((resolve, reject) => {
			ffmpeg.ffprobe(videoPath, (err, metadata) => {
				if (err) {
					reject(err);
				} else {
					resolve({
						width: metadata.streams[0].width,
						height: metadata.streams[0].height,
					});
				}
			});
		});
	}
	protected async addAudioToVideo(
		videoPath: string,
		audioPath: string
	): Promise<void> {
		const tmpPath = videoPath + ".tmp.mp4";

		const totalFrames = await this.getTotalFrames(videoPath);

		const convertedAudioPath = await this.convertAudioToM4a(audioPath);

		return new Promise((resolve, reject) => {
			ffmpeg()
				.input(videoPath)
				.input(convertedAudioPath)
				.outputOptions([
					"-y", // overwrite output file if exists
					"-map 0:v", // map the video from the first input
					"-map 1:a", // map the audio from the second input
					"-c:v libx264", // use libx264 codec for video
					"-c:a aac", // use aac codec for audio
				])
				.on("start", function (commandLine) {
					console.log("Spawned FFmpeg with command: " + commandLine);
				})
				.on("end", () => {
					fs.rename(tmpPath, videoPath, (err) => {
						if (err) reject(err);
						else resolve();
					});
				})
				.on("error", (error) => {
					console.error("Error add audio:", error.message);
					reject(error);
				})
				.on("progress", (progress) => {
					this.logger(`Adding audio: ${progress.frames} / ${totalFrames}`);
				})
				.save(tmpPath);
		});
	}

	protected async convertAudioToM4a(audioPath: string): Promise<string> {
		const outputPath = path.join(os.tmpdir(), "temp-audio.m4a");
		return new Promise((resolve, reject) => {
			ffmpeg(audioPath)
				.outputOptions([
					"-y", // overwrite output file if exists
					"-acodec aac", // use aac codec for audio
				])
				.save(outputPath)
				.on("end", () => {
					resolve(outputPath);
				})
				.on("error", reject);
		});
	}

	protected async generateSilence(
		durationInSeconds: number,
		outputPath: string = "/tmp/silence.m4a"
	): Promise<void> {
		return new Promise((resolve, reject) => {
			ffmpeg()
				.input("anullsrc")
				.inputOptions([
					"-f",
					"lavfi", // input format
					"-ac",
					"1", // audio channels (mono)
				])
				.outputOptions([
					"-ar",
					"11025", // audio sample rate
					"-t",
					`${durationInSeconds}`, // duration
					"-c:a",
					"aac", // audio codec
				])

				.save(outputPath)
				.on("end", resolve)
				.on("error", reject);
		});
	}
	protected async writeTranscriptionOnVideo(
		videoPath: string,
		transcriptions: Transcription[]
	): Promise<string> {
		const totalFrames = await this.getTotalFrames(videoPath);
		console.log("writeTranscriptionOnVideo");
		const tmpPath = videoPath + ".tmp.mp4";

		return new Promise((resolve, reject) => {
			// Define an array to store all the filters
			let filters: any[] = [];

			// Create the filters for each transcription
			transcriptions.forEach((transcript, index) => {
				console.log("start", transcript.start, "end", transcript.end);

				filters.push(
					`drawtext=enable='between(t,${toSeconds(
						transcript.start
					)},${toSeconds(transcript.end)})': text=' ${escapeSingleQuotes(
						transcript.speech
					)}':fontfile='${fontPath}':fontcolor='white': fontsize='h/20': x='(w-text_w)/2': y='(h-text_h)/2': borderw=5: shadowcolor=black: shadowx=8: shadowy=8`
				);
			});

			ffmpeg(videoPath)
				// .inputOptions("-report")
				.videoFilters(filters)
				.on("end", () => {
					fs.rename(tmpPath, videoPath, (err) => {
						if (err) reject(err);
						else resolve(videoPath);
					});
				})
				.on("error", (error: Error) => reject(error.message))
				.on("progress", (progress) => {
					this.logger(
						`Writing transcription: ${progress.frames} / ${totalFrames}`
					);
				})
				.save(tmpPath);
		});
	}
	public async getVideoUrl(videoPath: string): Promise<string> {
		const videoName = path.basename(videoPath);
		const newVideoPath = path.resolve(
			__dirname,
			"..",
			"..",
			"public",
			videoName
		);

		await copyFile(videoPath, newVideoPath);
		await unlink(videoPath);
		return `http://localhost:${port}/public/${videoName}`;
	}
	// Other methods...
}
