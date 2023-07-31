import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import ytdl from "ytdl-core";
import shell from "shelljs";
import stream from "stream";
export interface IShellOptions {
	silent: boolean; // true: won't print to console
	async: boolean;
}

// default passed to shelljs exec
const defaultShellOptions = {
	silent: true, // true: won't print to console
	async: false,
};
export function convertMp3ToWav(sourceFile: string) {
	const targetFile = sourceFile.replace(".mp3", "-temp.wav");
	return new Promise<string>((resolve, reject) => {
		ffmpeg(sourceFile)
			.output(targetFile)
			.audioChannels(1)
			.audioFrequency(16000)
			.on("end", function () {
				console.log("Conversion finished!");
				resolve(targetFile);
			})
			.on("error", function (err) {
				console.log("An error occurred: " + err.message);
				reject(err);
			})
			.run();
	});
}
export async function getTotalFrames(videoPath: string): Promise<any> {
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(videoPath, (err, data) => {
			if (err) reject(err);
			else resolve(data.streams[0].nb_frames);
		});
	});
}

export type Transcription = {
	start: string;
	end: string;
	speech: string;
};

export function improveTranscription(
	transcriptions: Transcription[],
	originalText: string
) {
	// Lowercase the original text and standardize the apostrophes for case-insensitive comparison
	originalText = originalText.toLowerCase().replace("’", "'");

	// Remove empty speech segments and punctuation
	var refinedTranscriptions = transcriptions.filter(
		(t) => t.speech.trim() && ![",", ".", "!", "?"].includes(t.speech.trim())
	);

	// Combine adjacent speech segments that form a single word in the original text
	var i = 0;
	while (i < refinedTranscriptions.length - 1) {
		var currentSpeech = refinedTranscriptions[i].speech.trim().toLowerCase();
		var nextSpeech = refinedTranscriptions[i + 1].speech.trim().toLowerCase();

		// Directly combine the current speech and the next speech
		var combinedSpeech = currentSpeech + nextSpeech;
		if (originalText.includes(combinedSpeech)) {
			refinedTranscriptions[i].speech = currentSpeech + nextSpeech.trimStart();
			refinedTranscriptions[i].end = refinedTranscriptions[i + 1].end;
			refinedTranscriptions.splice(i + 1, 1); // Remove the next item
		} else {
			i += 1;
		}
	}

	return refinedTranscriptions;
}
export function adjustTranscriptionTimes(
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
export function toSeconds(time: string): number {
	const [hours, minutes, seconds] = time.split(":").map(parseFloat);
	return hours * 3600 + minutes * 60 + seconds;
}

export function toTimeString(seconds: number): string {
	let hours = Math.floor(seconds / 3600);
	let minutes = Math.floor((seconds % 3600) / 60);
	let secondsFraction = seconds % 60;
	return `${hours.toString().padStart(2, "0")}:${minutes
		.toString()
		.padStart(2, "0")}:${secondsFraction.toFixed(3).padStart(6, "0")}`;
}
export function parseVtt(filePath: string): Transcription[] {
	// Read the content of the file
	const content = fs.readFileSync(filePath, "utf8");

	// Split the content by newline characters to get each line
	const lines = content.split("\n");

	// Initialize an empty array to store the parsed data
	let parsedData = [];

	// Loop through each line
	for (let i = 0; i < lines.length; i++) {
		// Ignore the header line and empty lines
		if (lines[i] === "WEBVTT" || lines[i] === "") {
			continue;
		}

		// If a line contains " --> ", it's a time line
		if (lines[i].includes(" --> ")) {
			// Get the time and text
			let time = lines[i].replace("\r", ""); // Remove \r
			let text = lines[i + 1] ? lines[i + 1].replace("\r", "") : ""; // Remove \r

			// Split the time by " --> " to get start and end time separately
			let [start, end] = time.split(" --> ");

			// Store the start time, end time, and text in an object
			let data: Transcription = {
				start: start,
				end: end,
				speech: text,
			};

			// Append the object to the array
			parsedData.push(data);

			// Skip the next line because it's the text that we already processed
			i++;
		}
	}

	// Return the parsed data
	return parsedData;
}

export async function downloadYoutubeVideo(
	url: string,
	log: any
): Promise<string> {
	const videoInfo = await ytdl.getInfo(url);
	const videoFormat = ytdl.chooseFormat(videoInfo.formats, {
		quality: "highestvideo",
	});
	const videoPath = `/tmp/video-${Date.now()}.mp4`;
	return new Promise((resolve, reject) => {
		ytdl(url, { format: videoFormat })
			.on("finish", () => {
				resolve(videoPath);
			})
			.on("error", (err) => {
				reject(err);
			})
			.on("progress", (chunkLength, downloaded, total) => {
				const downloadedMB = (downloaded / 1024 / 1024).toFixed(2);
				const totalMB = (total / 1024 / 1024).toFixed(2);
				const percent = downloaded / total;

				log(
					`Downloading video: ${Math.floor(
						percent * 100
					)}% (${downloadedMB}MB / ${totalMB}MB)`
				);
			})
			.pipe(fs.createWriteStream(videoPath));
	});
}
// export async function downloadYoutubeVideo(
// 	url: string,
// 	log: any
// ): Promise<string> {
// 	const videoInfo = await ytdl.getInfo(url);
// 	const videoFormat = ytdl.chooseFormat(videoInfo.formats, {
// 		quality: "highestvideo",
// 	});
// 	const videoPath = `/tmp/video-${Date.now()}.mp4`;
// 	const videoStream = ytdl(url, { format: videoFormat });

// 	return new Promise((resolve, reject) => {
// 		const writableStream = new stream.Writable();
// 		writableStream._write = (chunk, encoding, done) => {
// 			// Do nothing
// 			done();
// 		};

// 		ffmpeg(videoStream)
// 			.inputOption("-report")
// 			.format("mp4")
// 			.setDuration(2 * 60) // Set duration here
// 			// .output(fs.createWriteStream(videoPath))
// 			.on("end", function () {
// 				resolve(videoPath);
// 			})
// 			.on("error", function (err) {
// 				reject(err);
// 			})
// 			.on("progress", (progress) => {
// 				log(`Downloading video: ${progress.percent}%`);
// 			})
// 			.save(videoPath);
// 	});
// }
export async function cropVideoToVertical(
	videoPath: string,
	endTime: number | undefined,
	log: any
): Promise<void> {
	const tmpPath = videoPath + ".tmp.mp4";
	const totalFrames = await getTotalFrames(videoPath);

	return new Promise((resolve, reject) => {
		ffmpeg(videoPath)
			.outputOptions("-vf", "crop=ih*9/16:ih") // Crop to 9:16 ratio
			.outputOptions("-to", `${endTime}`) // Trim to endTime
			.save(tmpPath)
			.on("end", () => {
				fs.rename(tmpPath, videoPath, (err) => {
					if (err) reject(err);
					else resolve();
				});
			})
			.on("error", reject)
			.on("progress", (progress) => {
				log(`Cropping video: ${progress.frames} / ${totalFrames}`);
			});
	});
}
export async function getVideoDimensions(
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

export async function getDuration(
	assetPath: string
): Promise<number | undefined> {
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

export default async function asyncShell(
	command: string,
	options: IShellOptions = defaultShellOptions
): Promise<any> {
	return new Promise(async (resolve, reject) => {
		try {
			// docs: https://github.com/shelljs/shelljs#execcommand--options--callback
			shell.exec(
				command,
				options,
				(code: number, stdout: string, stderr: string) => {
					if (code === 0) resolve(stdout);
					else reject(stderr);
				}
			);
		} catch (error) {
			reject(error);
		}
	});
}
