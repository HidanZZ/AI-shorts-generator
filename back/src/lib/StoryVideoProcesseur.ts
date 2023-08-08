import { DoneCallback, Job } from "bull";
import { Transcription, VideoProcessor } from "./VideoProcessor";
import { JobData } from "../types/data";
import { TextProcessing } from "./TextProcessing";
import { checkVideoExists, parseVtt } from "../utils";
import path from "path";
import fs from "fs";
import { tempDir } from "../constants/processingPath";

export class StoryVideoProcesseur extends VideoProcessor {
	private story: string;

	constructor(job: Job<JobData>, done: DoneCallback) {
		super(job, done);
		const { story } = job.data;
		this.story = story ?? "";
	}

	protected async textProcessing() {
		this.currentProgress = 1;
		this.logger("Fixing grammar");
		try {
			this.story = await TextProcessing.fixGrammar(this.story);
		} catch (err: any) {
			this.done(err);
		}
	}
	protected async audioProcessing() {
		if (!this.audioStrategy) {
			throw new Error("No audio strategy is defined");
		}
		this.currentProgress = 8;
		this.logger("Generating audio from text");

		const { audio, subtitles } = await this.audioStrategy.generateAudio(
			this.story,
			this.voice
		);
		this.currentProgress = 15;
		this.logger("Getting transcription");
		console.log("[audioProcessing] subtitles", subtitles);

		const improvedTranscription = parseVtt(subtitles);

		return { audio, improvedTranscription };
	}
	protected async videoPreProcessing(audio: string) {
		this.currentProgress = 40;
		this.logger("Preparing background video");
		const downloadedVidPath = await checkVideoExists(this.video, this.logger);
		this.currentProgress = 50;
		//copy video to tmp folder
		const now = Date.now();
		const format = path.extname(downloadedVidPath);
		const videoPath = path.join(tempDir, `${now}${format}`);
		fs.copyFileSync(downloadedVidPath, videoPath);
		this.currentProgress = 60;
		this.logger("Cropping video");
		const audioDuration = await this.getDuration(audio);
		console.log("audioDuration", audioDuration);

		let from = 0;
		if (this.useRandomVideoTime) {
			from = await this.getRandomeVideoStartTime(videoPath, audioDuration);
		}

		await this.cropVideoToVertical(videoPath, from, audioDuration);
		return {
			videoPath,
		};
	}
	protected async videoRendering(
		videoPath: string,
		audio: string,
		adjustedTranscriptions: Transcription[]
	) {
		// Step 10: Add audio to video
		this.currentProgress = 80;
		this.logger("Adding audio to video");
		await this.addAudioToVideo(videoPath, audio);
		// Step 8: Write transcription on video
		this.currentProgress = 90;
		this.logger("Writing transcription on video");

		const finalVid = await this.writeTranscriptionOnVideo(
			videoPath,
			adjustedTranscriptions
		);
		// Step 10: Done
		this.currentProgress = 99;

		return finalVid;
	}
	public async process() {
		try {
			await this.textProcessing();
			const { audio, improvedTranscription } = await this.audioProcessing();
			if (!this.job.data.modifiedSubtitles) {
				await this.job.queue.pause();
				console.log("[process] paused queue");

				this.sendSubtitlesToUserForModification(improvedTranscription);
				console.log("[process] sent subtitles to user for modification");

				return;
			}
			const { videoPath } = await this.videoPreProcessing(audio);
			const finalVid = await this.videoRendering(
				videoPath,
				audio,
				improvedTranscription
			);
			this.logger("finalizing");
			const { title, description } = await this.getYouTubeMetadata(this.story);
			const videoUrl = await this.getVideoUrl(finalVid, title);
			//save title and description to file
			const videoInfo = path.resolve(
				__dirname,
				"..",
				"..",
				"public",
				`${title}.json`
			);
			fs.writeFileSync(videoInfo, JSON.stringify({ title, description }));
			this.clearTempFiles();

			this.currentProgress = 100;
			this.logger("Done");

			this.done(null, { videoUrl });
		} catch (error: any) {
			console.log("error", error);
			this.done(error); // report failure
		}
	}
}
