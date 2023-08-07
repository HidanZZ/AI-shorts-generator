import { DoneCallback, Job } from "bull";
import { Transcription, VideoProcessor } from "./VideoProcessor";
import path from "path";
import { tempDir } from "../constants/processingPath";
import { TextProcessing } from "./TextProcessing";
import fs from "fs";
import { redditQuestionImage } from "../utils/image";
import { checkVideoExists, getWordCount, parseVtt } from "../utils";
import { JobData } from "../types/data";

export class RedditVideoProcessor extends VideoProcessor {
	private redditQuestion: string;
	private redditAnswer: string;
	private momemtOfSilence: number = 1;
	private useAiGeneratedStory: boolean = false;
	private isYoutube: boolean = false;
	constructor(job: Job<JobData>, done: DoneCallback) {
		super(job, done);
		const { redditAnswer, redditQuestion, useAiGeneratedStory, isYoutube } =
			job.data;
		this.useAiGeneratedStory = useAiGeneratedStory;
		this.redditAnswer = redditAnswer ?? "";
		this.redditQuestion = redditQuestion ?? "";
		this.isYoutube = isYoutube;
		this.momemtOfSilence = this.isYoutube ? 0.5 : 1;
	}
	protected async generateAnswer(question: string) {
		let current_realistic_score = 0;
		let answer: string = "";
		while (current_realistic_score < 8) {
			try {
				answer = await TextProcessing.generateRedditAnswer(
					question,
					this.isYoutube
				);
				const word_count = getWordCount(answer);
				console.log("word_count", word_count);

				if (word_count > 150 && this.isYoutube) {
					continue;
				}
				const score = await this.getAverageScore(answer);
				console.log("average score", score);

				if (!score) throw new Error("No score from openai");
				current_realistic_score = score;
				console.log("current_realistic_score", current_realistic_score);
			} catch (err: any) {
				this.done(err);
			}
		}
		return answer;
	}
	protected async getAverageScore(answer: string) {
		return Promise.all([
			TextProcessing.judgeRedditAnswer(answer),
			TextProcessing.judgeRedditAnswer(answer),
			TextProcessing.judgeRedditAnswer(answer),
		]).then((scores: any) => {
			const averageScore =
				scores.reduce((acc: number, score: any) => {
					return acc + JSON.parse(score).score;
				}, 0) / scores.length;
			return averageScore;
		});
	}
	protected async generateQuestion(): Promise<string> {
		let question: string = "";
		while (question.length < 40) {
			try {
				question = await TextProcessing.generateRedditQuestion();
			} catch (err: any) {
				this.done(err);
			}
		}
		return question;
	}
	protected async getQuestionImage() {
		const questionImagePath = path.join(tempDir, "question-image.png");
		await redditQuestionImage(this.redditQuestion, questionImagePath);
		return questionImagePath;
	}

	protected async textProcessing() {
		this.currentProgress = 0;

		let question = this.redditQuestion;
		let answer = this.redditAnswer;
		if (this.useAiGeneratedStory) {
			this.logger("Generating question ");
			question = await this.generateQuestion();
			this.logger("Generating answer ");
			answer = await this.generateAnswer(question);
		} else {
			this.logger("Fixing answer grammar");
			answer = await TextProcessing.fixGrammar(answer);
		}

		this.redditQuestion = question;
		this.redditAnswer = answer;
	}
	protected async audioProcessing() {
		if (!this.audioStrategy) {
			throw new Error("No audio strategy is defined");
		}
		this.currentProgress = 8;
		this.logger("Generating audio from text");
		const { audio: tempQuestionAudio } = await this.audioStrategy.generateAudio(
			this.redditQuestion,
			this.voice,
			false
		);
		const { audio: tempAnswerAudio, subtitles } =
			await this.audioStrategy.generateAudio(this.redditAnswer, this.voice);
		// Step 2: getting transcription
		this.currentProgress = 15;
		this.logger("Getting transcription");
		console.log("[audioProcessing] subtitles", subtitles);

		const improvedAnswerTranscription = parseVtt(subtitles);

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
		const format = path.extname(downloadedVidPath);
		const videoPath = path.join(tempDir, `${now}${format}`);

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
		this.currentProgress = 99;

		return finalVid;
	}
	public async process() {
		try {
			await this.textProcessing();
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
			this.logger("finalizing");
			const { title, description } = await this.getYouTubeMetadata(
				this.redditAnswer
			);
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
