import fs from "fs";
import ytdl from "ytdl-core";
import shell from "shelljs";
import stream from "stream";
import { Transcription } from "../lib/VideoProcessor";
import path from "path";
import os from "os";
import { Asset } from "../types/data";
import { IAsset } from "../models/assets";
import { assetsService } from "../services/assetsService";
export interface IShellOptions {
	silent: boolean; // true: won't print to console
	async: boolean;
}

// default passed to shelljs exec
const defaultShellOptions = {
	silent: true, // true: won't print to console
	async: false,
};

export const isUrlYoutube = (url: string) => {
	const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
	return regex.test(url);
};

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
// Helper function to convert mm:ss to HH:mm:ss
function convertTimeFormat(time: string): string {
	const segments = time.split(":");
	if (segments.length === 3) {
		// Already in HH:mm:ss format
		return time;
	}
	// If in mm:ss format, add an hour segment
	return "00:" + time;
}

export function parseVtt(filePath: string | undefined): Transcription[] {
	if (!filePath) {
		throw new Error("no file path");
	}

	const content = fs.readFileSync(filePath, "utf8");
	const lines = content.split("\n");
	let parsedData = [];

	for (let i = 0; i < lines.length; i++) {
		if (lines[i] === "WEBVTT" || lines[i] === "") {
			continue;
		}

		if (lines[i].includes(" --> ")) {
			let time = lines[i].replace("\r", "");
			let text = lines[i + 1] ? lines[i + 1].replace("\r", "") : "";

			// Use convertTimeFormat function here
			let [start, end] = time.split(" --> ").map(convertTimeFormat);

			let data: Transcription = {
				start: start,
				end: end,
				speech: text,
			};

			parsedData.push(data);
			i++;
		}
	}

	return parsedData;
}

export async function checkVideoExists(videoId: string, logger: any) {
	const video: IAsset = await assetsService.getAssetByIdService(videoId);
	if (!video) {
		throw new Error("Video not found");
	}
	if (video.downloadedPath) {
		return video.downloadedPath;
	}

	return downloadYoutubeVideo(video, logger);
}

export async function downloadYoutubeVideo(
	video: IAsset,
	log: any
): Promise<string> {
	const url = video.url;
	const videoInfo = await ytdl.getInfo(url);
	const videoFormat = ytdl.chooseFormat(videoInfo.formats, {
		quality: "highestvideo",
	});
	const downloadedVideosFolder = path.join(os.homedir(), "videos");
	//check if folder exists
	if (!fs.existsSync(downloadedVideosFolder)) {
		fs.mkdirSync(downloadedVideosFolder);
	}
	const videoPath = path.join(
		downloadedVideosFolder,
		`${videoInfo.videoDetails.videoId}.${videoFormat.container}`
	);
	return new Promise((resolve, reject) => {
		ytdl(url, { format: videoFormat })
			.on("finish", async () => {
				video.downloadedPath = videoPath;
				await assetsService.updateAsset(video);
				resolve(video.downloadedPath);
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
