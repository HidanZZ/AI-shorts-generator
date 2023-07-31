import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import ytdl from "ytdl-core";
import shell from "shelljs";
import stream from "stream";
import { Transcription } from "../lib/VideoProcessor";
export interface IShellOptions {
	silent: boolean; // true: won't print to console
	async: boolean;
}

// default passed to shelljs exec
const defaultShellOptions = {
	silent: true, // true: won't print to console
	async: false,
};

export function toSeconds(time: string): number {
	const [hours, minutes, seconds] = time.split(":").map(parseFloat);
	return hours * 3600 + minutes * 60 + seconds;
}
export const isUrlYoutube = (url: string) => {
	const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
	return regex.test(url);
};

export function toTimeString(seconds: number): string {
	let hours = Math.floor(seconds / 3600);
	let minutes = Math.floor((seconds % 3600) / 60);
	let secondsFraction = seconds % 60;
	return `${hours.toString().padStart(2, "0")}:${minutes
		.toString()
		.padStart(2, "0")}:${secondsFraction.toFixed(3).padStart(6, "0")}`;
}
export function parseVtt(filePath: string | undefined): Transcription[] {
	// Read the content of the file
	if (!filePath) {
		throw new Error("no file path");
	}
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

export function escapeSingleQuotes(str: string) {
	return str.replace(/'/g, "'\\''");
}
export function escapeDoubleQuotes(input: string): string {
	return input.replace(/"/g, '\\"');
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
