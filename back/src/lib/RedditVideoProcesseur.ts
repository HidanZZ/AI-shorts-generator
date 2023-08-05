import { DoneCallback, Job } from "bull";
import { Transcription, VideoProcessor } from "./VideoProcessor";
import path from "path";
import { tempDir } from "../constants/processingPath";

import fs from "fs";
import { redditQuestionImage } from "../utils/image";
import { checkVideoExists, downloadYoutubeVideo, parseVtt } from "../utils";

export class RedditVideoProcessor extends VideoProcessor {
	private redditQuestion: string;
	private redditAnswer: string;
	private momemtOfSilence: number = 1;

	constructor(job: Job<any>, done: DoneCallback) {
		super(job, done);
		const { redditAnswer, redditQuestion } = job.data;
		this.redditAnswer = redditAnswer;
		this.redditQuestion = redditQuestion;
	}
	protected async getQuestionImage() {
		const questionImagePath = path.join(tempDir, "question-image.png");
		await redditQuestionImage(this.redditQuestion, questionImagePath);
		return questionImagePath;
	}
	protected async audioProcessing() {
		if (!this.audioStrategy) {
			throw new Error("No audio strategy is defined");
		}

		this.currentProgress = 0;
		this.logger("Generating question audio from text");
		const { audio: tempQuestionAudio } = await this.audioStrategy.generateAudio(
			this.redditQuestion,
			this.voice,
			false
		);
		const { audio: tempAnswerAudio, subtitles } =
			await this.audioStrategy.generateAudio(this.redditAnswer, this.voice);
		// Step 2: getting transcription
		this.currentProgress = 10;
		this.logger("Getting transcription");
		console.log("[audioProcessing] subtitles", subtitles);

		const improvedAnswerTranscription = parseVtt(subtitles);
		console.log(
			"[audioProcessing] improvedAnswerTranscription",
			improvedAnswerTranscription
		);

		// Step 5: combine audios
		this.currentProgress = 20;
		this.logger("Combining audios");
		const combinedAudioPath = await this.combineAudios(
			tempQuestionAudio,
			tempAnswerAudio,
			this.momemtOfSilence
		);
		const questionAudioDuration =
			(await this.getDuration(tempQuestionAudio)) || 0;
		console.log("question duration", questionAudioDuration);

		const answerAudioStart = questionAudioDuration
			? questionAudioDuration + this.momemtOfSilence
			: 0;
		console.log("answerAudioStart", answerAudioStart);
		const adjustedTranscriptions = this.adjustTranscriptionTimes(
			improvedAnswerTranscription,
			answerAudioStart
		);
		return {
			combinedAudioPath,
			questionAudioDuration,
			adjustedTranscriptions,
		};
	}
	protected async videoPreProcessing(combinedAudioPath: string) {
		this.currentProgress = 30;
		this.logger("Getting question image");
		const questionImagePath = await this.getQuestionImage();
		// Step 6: Prepare background video
		this.currentProgress = 40;
		this.logger("Preparing background video");
		const downloadedVidPath = await checkVideoExists(this.video, this.logger);
		// step 7: download video
		this.currentProgress = 50;
		//copy video to tmp folder
		const now = Date.now();
		const videoPath = path.join(tempDir, `${now}.mp4`);
		fs.copyFileSync(downloadedVidPath, videoPath);
		//step 8: crop video to vertical
		this.currentProgress = 60;
		this.logger("Cropping video");
		const audioDuration = await this.getDuration(combinedAudioPath);
		console.log(" full audio duration", audioDuration);
		let from = 0;
		if (this.useRandomVideoTime) {
			from = await this.getRandomeVideoStartTime(videoPath, audioDuration);
		}
		console.log("froooooooom", from);

		await this.cropVideoToVertical(videoPath, from, audioDuration);
		return {
			questionImagePath,
			videoPath,
		};
	}
	protected async videoRendering(
		questionImagePath: string,
		videoPath: string,
		combinedAudioPath: string,
		questionAudioDuration: number,
		adjustedTranscriptions: Transcription[]
	) {
		this.currentProgress = 70;
		this.logger("Inserting question image");

		await this.insertImageInVideo(
			videoPath,
			questionImagePath,
			0,
			questionAudioDuration
		);
		// Step 10: Add audio to video
		this.currentProgress = 80;
		this.logger("Adding audio to video");
		await this.addAudioToVideo(videoPath, combinedAudioPath);
		// Step 8: Write transcription on video
		this.currentProgress = 90;
		this.logger("Writing transcription on video");

		const finalVid = await this.writeTranscriptionOnVideo(
			videoPath,
			adjustedTranscriptions
		);
		// Step 10: Done
		this.currentProgress = 100;
		this.logger("Done");

		return finalVid;
	}
	public async process() {
		try {
			const {
				combinedAudioPath,
				questionAudioDuration,
				adjustedTranscriptions,
			} = await this.audioProcessing();
			const { questionImagePath, videoPath } = await this.videoPreProcessing(
				combinedAudioPath
			);
			const finalVid = await this.videoRendering(
				questionImagePath,
				videoPath,
				combinedAudioPath,
				questionAudioDuration,
				adjustedTranscriptions
			);

			const videoUrl = await this.getVideoUrl(finalVid);
			this.clearTempFiles();

			this.done(null, { videoUrl });
		} catch (error: any) {
			console.log("error", error);
			this.done(error); // report failure
		}
	}
}
