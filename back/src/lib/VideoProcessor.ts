import { elevenlabsText2Speech } from "./elevenLabsApi";
import fs from "fs";
import { tempDir } from "../constants/processingPath";

import path from "path";
import asyncShell, {
	escapeSingleQuotes,
	toSeconds,
	toTimeString,
} from "../utils";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { DoneCallback, Job } from "bull";
import { IAudioStrategy } from "./AudioStrategies";
import { copyFile, unlink } from "fs/promises";
import { port } from "..";
import { whisperTranscribe } from "../utils/audio";
import { keysService } from "../services/keysService";
import { API_KEYS } from "../constants/keys";
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
	protected useGPU: boolean = true;
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
	protected async clearTempFiles() {
		const files = fs.readdirSync(tempDir);
		files.forEach((file) => {
			fs.unlinkSync(path.join(tempDir, file));
		});
	}

	public async getAudio(text: string, voice: string): Promise<string> {
		const apiKey = await keysService.getKey(API_KEYS.ELEVENLABS);
		if (!apiKey) {
			throw new Error("no api key found");
		}
		const audioData = await elevenlabsText2Speech(apiKey, text, voice);
		const timestamp = Date.now();
		const tempFilePath = path.join(tempDir, "audio-" + timestamp + ".mp3");
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
		const voice1 = "en-CA-LiamNeural";
		const timestamp = Date.now();
		const tempAudioPath = path.join(tempDir, `temp-audio-${timestamp}.mp3`);
		const tempSubtitlesPath = path.join(
			tempDir,
			`temp-subtitles-${timestamp}.vtt`
		);
		const command = `edge-tts --voice ${voice1}  --text "${text}" --write-media ${tempAudioPath} --words-in-cue 1 --write-subtitles ${tempSubtitlesPath} --rate "+5%"`;
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
		const silencePath = path.join(tempDir, "silence.m4a");
		const outputPath = path.join(tempDir, "combined.m4a");
		console.log("combineAudios");

		// Generate silence
		await this.generateSilence(silenceDuration, silencePath);
		console.log("combineAudios2");

		// Combine audios
		return new Promise((resolve, reject) => {
			let processor = ffmpeg();
			if (this.useGPU) {
				processor
					.videoCodec("h264_nvenc") // Use Nvidia's hardware-accelerated H264 encoder
					.outputOptions("-rc:v", "vbr") // Variable bitrate
					.outputOptions("-cq", "18"); // Maximum quantizer scale
			} else {
				processor
					.videoCodec("libx264") // Use software (CPU) encoding
					.outputOptions("-preset", "slow")
					.outputOptions("-crf", "18");
			}
			processor
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

	protected async cropVideoToVertical(
		videoPath: string,
		from: number,
		duration: number | undefined
	): Promise<void> {
		if (!duration) {
			throw new Error("duration is undefined");
		}
		const format = path.extname(videoPath);
		const tmpPath = videoPath + ".tmp" + format;
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
			let processor = ffmpeg(videoPath);
			if (this.useGPU) {
				processor
					.videoCodec("h264_nvenc") // Use Nvidia's hardware-accelerated H264 encoder
					.outputOptions("-rc:v", "vbr") // Variable bitrate
					.outputOptions("-cq", "18"); // Maximum quantizer scale
			} else {
				processor
					.videoCodec("libx264") // Use software (CPU) encoding
					.outputOptions("-preset", "slow")
					.outputOptions("-crf", "18");
			}
			processor
				.setStartTime(startTime)
				.setDuration(duration)
				.complexFilter(
					[
						{
							filter: "eq",
							options: { brightness: 0.02 },
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

	protected async resizeImage(
		imagePath: string,
		width: number
	): Promise<string> {
		const outputImagePath = imagePath + ".resized.png";
		const imageDimensions = await this.getVideoDimensions(imagePath);
		const aspectRatio = imageDimensions.width / imageDimensions.height;
		await sharp(imagePath)
			.resize({
				width: Math.floor(width),
				height: Math.round(width / aspectRatio),
				fit: "contain", // keep aspect ratio, do not crop the image
				background: { r: 0, g: 0, b: 0, alpha: 0 }, // fill with transparent background where needed
			})
			.toFile(outputImagePath);
		return outputImagePath;
	}
	protected async insertImageInVideo(
		videoPath: string,
		imagePath: string,
		startSeconds: number,
		durationSeconds: number | undefined
	): Promise<void> {
		const format = path.extname(videoPath);
		const tmpPath = videoPath + ".tmp" + format;
		if (!durationSeconds) {
			throw new Error("durationSeconds is undefined");
		}

		const totalFrames = await this.getTotalFrames(videoPath);
		const videoDimensions = await this.getVideoDimensions(videoPath);
		const newImageWidth = videoDimensions.width * 0.8;
		const resizedImagePath = await this.resizeImage(imagePath, newImageWidth);
		const imageDimensions = await this.getVideoDimensions(resizedImagePath);

		const overlayX = (videoDimensions.width - imageDimensions.width) / 2;
		const overlayY = (videoDimensions.height - imageDimensions.height) / 2;

		return new Promise((resolve, reject) => {
			let processor = ffmpeg();
			if (this.useGPU) {
				processor
					.videoCodec("h264_nvenc") // Use Nvidia's hardware-accelerated H264 encoder
					.outputOptions("-rc:v", "vbr") // Variable bitrate
					.outputOptions("-cq", "18"); // Maximum quantizer scale
			} else {
				processor
					.videoCodec("libx264") // Use software (CPU) encoding
					.outputOptions("-preset", "slow")
					.outputOptions("-crf", "18");
			}
			processor
				.input(videoPath)
				.input(resizedImagePath)
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
		const format = path.extname(videoPath);
		const tmpPath = videoPath + ".tmp" + format;

		const totalFrames = await this.getTotalFrames(videoPath);

		const convertedAudioPath = await this.convertAudioToM4a(audioPath);

		return new Promise((resolve, reject) => {
			let processor = ffmpeg();
			if (this.useGPU) {
				processor
					.videoCodec("h264_nvenc") // Use Nvidia's hardware-accelerated H264 encoder
					.outputOptions("-rc:v", "vbr") // Variable bitrate
					.outputOptions("-cq", "18"); // Maximum quantizer scale
			} else {
				processor
					.videoCodec("libx264") // Use software (CPU) encoding
					.outputOptions("-preset", "slow")
					.outputOptions("-crf", "18");
			}
			processor
				.input(videoPath)
				.input(convertedAudioPath)
				.outputOptions([
					"-y", // overwrite output file if exists
					"-map 0:v", // map the video from the first input
					"-map 1:a", // map the audio from the second input
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
		const outputPath = path.join(tempDir, "temp-audio.m4a");
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
		const format = path.extname(videoPath);
		const tmpPath = videoPath + ".tmp" + format;

		return new Promise((resolve, reject) => {
			// Define an array to store all the filters
			let filters: any[] = [];

			// Create the filters for each transcription
			transcriptions.forEach((transcript, index) => {
				filters.push(
					`drawtext=enable='between(t,${toSeconds(
						transcript.start
					)},${toSeconds(transcript.end)})': text=' ${escapeSingleQuotes(
						transcript.speech
					)}':fontfile='${fontPath}':fontcolor='white': fontsize='h/16': x='(w-text_w)/2': y='(h-text_h)/2': borderw=5: shadowcolor=black: shadowx=8: shadowy=8`
				);
			});

			let processor = ffmpeg(videoPath);
			if (this.useGPU) {
				processor
					.videoCodec("h264_nvenc") // Use Nvidia's hardware-accelerated H264 encoder
					.outputOptions("-rc:v", "vbr") // Variable bitrate
					.outputOptions("-cq", "18"); // Maximum quantizer scale
			} else {
				processor
					.videoCodec("libx264") // Use software (CPU) encoding
					.outputOptions("-preset", "slow")
					.outputOptions("-crf", "18");
			}
			processor
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
	public async getVideoUrl(videoPath: string, title: string): Promise<string> {
		const videoExtension = path.extname(videoPath);
		const videoName = `${title}${videoExtension}`;
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
