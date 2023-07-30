import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import os from "os";
import {
	Transcription,
	getTotalFrames,
	getVideoDimensions,
	toSeconds,
} from ".";
import path from "path";
const fontPath = path.join(__dirname, "../../fonts/font.otf");
console.log("fontPath", fontPath);

export async function insertImageInVideo(
	videoPath: string,
	imagePath: string,
	startSeconds: number,
	durationSeconds: number | undefined,
	logger: any
): Promise<void> {
	const tmpPath = videoPath + ".tmp.mp4";
	if (!durationSeconds) {
		throw new Error("durationSeconds is undefined");
	}

	const totalFrames = await getTotalFrames(videoPath);

	const imageDimensions = await getVideoDimensions(imagePath);
	const videoDimensions = await getVideoDimensions(videoPath);

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
				logger(`Inserting image: ${progress.frames} / ${totalFrames}`);
			})
			.save(tmpPath);
	});
}

export async function addAudioToVideo(
	videoPath: string,
	audioPath: string,
	logger: any
): Promise<void> {
	const tmpPath = videoPath + ".tmp.mp4";

	const totalFrames = await getTotalFrames(videoPath);

	const convertedAudioPath = await convertAudioToM4a(audioPath);

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
				logger(`Adding audio: ${progress.frames} / ${totalFrames}`);
			})
			.save(tmpPath);
	});
}

async function convertAudioToM4a(audioPath: string): Promise<string> {
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

export async function combineAudios(
	audioPath1: string,
	audioPath2: string,
	silenceDuration: number
): Promise<string> {
	const silencePath = path.join(os.tmpdir(), "silence.m4a");
	const outputPath = path.join(os.tmpdir(), "combined.m4a");
	console.log("combineAudios");

	// Generate silence
	await generateSilence(silenceDuration, silencePath);
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
export function generateSilence(
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
// filters.push(
// 	`drawtext=enable='between(t,${toSeconds(transcript.start)},${toSeconds(
// 		transcript.end
// 	)})': text=' ${escapeSingleQuotes(
// 		transcript.speech
// 	)}':fontfile='${fontPath}':fontcolor='black': fontsize='(h/12)+4': x='(w-text_w)/2+2': y='(h-text_h)/2+2'`, //shadow
// 	`drawtext=enable='between(t,${toSeconds(transcript.start)},${toSeconds(
// 		transcript.end
// 	)})': text=' ${escapeSingleQuotes(
// 		transcript.speech
// 	)}':fontfile='${fontPath}':fontcolor='white': fontsize='h/12': x='(w-text_w)/2': y='(h-text_h)/2'`
// );
export async function writeTranscriptionOnVideo(
	videoPath: string,
	transcriptions: Transcription[],
	logger: any
): Promise<string> {
	const totalFrames = await getTotalFrames(videoPath);
	console.log("writeTranscriptionOnVideo");

	return new Promise((resolve, reject) => {
		// Define an array to store all the filters
		let filters: any[] = [];

		// Create the filters for each transcription
		transcriptions.forEach((transcript, index) => {
			console.log("start", transcript.start, "end", transcript.end);

			filters.push(
				`drawtext=enable='between(t,${toSeconds(transcript.start)},${toSeconds(
					transcript.end
				)})': text=' ${escapeSingleQuotes(
					transcript.speech
				)}':fontfile='${fontPath}':fontcolor='white': fontsize='h/12': x='(w-text_w)/2': y='(h-text_h)/2': borderw=5: shadowcolor=black: shadowx=8: shadowy=8`
			);
		});

		ffmpeg(videoPath)
			// .inputOptions("-report")
			.videoFilters(filters)
			.on("end", () => resolve("Transcription written on video"))
			.on("error", (error: Error) => reject(error.message))
			.on("progress", (progress) => {
				logger(`Writing transcription: ${progress.frames} / ${totalFrames}`);
			})
			.save(`${videoPath.split(".").slice(0, -1).join(".")}_transcripted.mp4`);
	});
}

function escapeSingleQuotes(str: string) {
	return str.replace(/'/g, "'\\''");
}
