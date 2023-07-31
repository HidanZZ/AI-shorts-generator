// pages/api/start-job.js
import Queue, { Job } from "bull";
import { Request, Response } from "express";
import { getAudio, getAudioTransciption } from "../lib/steps";
import fs from "fs";
import os from "os";
import path from "path";
import {
	adjustTranscriptionTimes,
	convertMp3ToWav,
	cropVideoToVertical,
	downloadYoutubeVideo,
	getDuration,
	getVideoDimensions,
	improveTranscription,
	parseVtt,
} from "../utils";
import { getAssetByIdService } from "../services/assetsService";
import { redditQuestionImage } from "../utils/image";
import {
	addAudioToVideo,
	combineAudios,
	insertImageInVideo,
	writeTranscriptionOnVideo,
} from "../utils/videoUtils";
import { textToSpeech } from "../utils/audio";
// Setup the job queue
const videoProcessingQueue = new Queue("video processing");
const logProgress = (job: Job, message: string, progress: number) => {
	job.progress({ message, progress }); // report progress
};

videoProcessingQueue.process(async (job, done) => {
	const { redditAnswer, redditQuestion, voice, video } = job.data;

	try {
		let currentProgress = 0;
		// const tempQuestionAudio = "/tmp/audio-1690725014554.mp3";
		// const tempAnswerAudio = "/tmp/big-speech.mp3";
		const customLogger = (message: string) => {
			logProgress(job, message, currentProgress);
		};
		// Step 1: Generate audio from text
		// logProgress(job, "Generating question audio from text", currentProgress);
		// const tempQuestionAudio = await getAudio(redditQuestion, voice);
		// const tempAnswerAudio = await getAudio(redditAnswer, voice);
		// // Step 2: Convert audio to wav
		// const tempAnswerAudioWav = await convertMp3ToWav(tempAnswerAudio);
		// // Step 3: Get transcription
		// logProgress(job, "Getting transcription", 0.5);
		// const tempAnswerTranscription = await getAudioTransciption(
		// 	tempAnswerAudioWav
		// );
		// // Step 4: Improve transcription
		// const improvedAnswerTranscription = improveTranscription(
		// 	tempAnswerTranscription,
		// 	redditAnswer
		// );

		const { audio: tempAnswerAudio, subtitles } = await textToSpeech(
			redditAnswer,
			"temp-answer",
			voice
		);
		const { audio: tempQuestionAudio } = await textToSpeech(
			redditQuestion,
			"temp-question",
			voice
		);
		const improvedAnswerTranscription = parseVtt(subtitles);

		// Step 5: Get question image
		logProgress(job, "Getting question image", 1);
		const questionImagePath = path.join(os.tmpdir(), "question-image.png");
		await redditQuestionImage(redditQuestion, questionImagePath);

		// Step 6: combine audios
		logProgress(job, "Combining audios", 0.5);
		const momentOfSilence = 1;
		const combinedAudioPath = await combineAudios(
			tempQuestionAudio,
			tempAnswerAudio,
			momentOfSilence
		);
		const questionAudioDuration = await getDuration(tempQuestionAudio);
		const answerAudioStart = questionAudioDuration
			? questionAudioDuration + momentOfSilence
			: 0;

		const pushedTranscriptions = adjustTranscriptionTimes(
			improvedAnswerTranscription,
			answerAudioStart
		);
		// Step 7: Prepare background video
		// logProgress(job, "Preparing background video", 0.5);
		currentProgress = 10;
		logProgress(job, "Preparing background video", currentProgress);
		//getting video url
		const { url } = await getAssetByIdService(video);
		currentProgress = 20;
		logProgress(job, "Downloading video", currentProgress);
		// download video
		const videoPath = await downloadYoutubeVideo(url, customLogger);
		currentProgress = 30;
		logProgress(job, "Cropping video", currentProgress);
		const audioDuration = await getDuration(combinedAudioPath);
		//crop video to vertical
		await cropVideoToVertical(videoPath, audioDuration, customLogger);
		console.log("audioDuration", audioDuration);
		currentProgress = 40;
		await insertImageInVideo(
			videoPath,
			questionImagePath,
			0,
			questionAudioDuration,
			customLogger
		);
		currentProgress = 50;
		logProgress(job, "Adding audio to video", currentProgress);
		await addAudioToVideo(videoPath, combinedAudioPath, customLogger);
		currentProgress = 60;
		logProgress(job, "Writing transcription on video", currentProgress);
		await writeTranscriptionOnVideo(
			videoPath,
			pushedTranscriptions,
			customLogger
		);
		currentProgress = 70;

		logProgress(job, "Generating video", 100);
		done(null, { message: "Video processed" });
	} catch (error: any) {
		console.log("error", error);

		done(error); // report failure
	}
});

export async function startJob(req: Request, res: Response) {
	const { redditQuestion, redditAnswer, voice, video } = await req.body;
	if (!redditAnswer) {
		return res.status(400).json({ message: "missing key ['redditAnswer']" });
	}

	const job = await videoProcessingQueue.add({
		redditAnswer,
		redditQuestion,
		voice,
		video,
	});

	return res.json({ jobId: job.id });
}

export async function getJobStatus(req: Request, res: Response) {
	const { jobId } = req.params;

	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");

	// Check if client is still connected
	req.on("close", () => {
		if (!res.writableEnded) {
			res.end();
			clearInterval(intervalId);
		}
	});

	const intervalId = setInterval(async () => {
		const job = await videoProcessingQueue.getJob(jobId);

		if (job === null || !res.writable) {
			// Job does not exist or client disconnected
			clearInterval(intervalId);
			if (!res.writableEnded) {
				res.write(
					`event: jobStatus\ndata: ${JSON.stringify({
						status: "Job not found",
					})}\n\n`
				);
				res.end();
			}
			return;
		}

		const jobState = await job.getState();
		const { progress, message } = job.progress();

		if (jobState === "completed" || jobState === "failed") {
			res.write(
				`event: jobStatus\ndata: ${JSON.stringify({
					status: jobState,
					progress,
					isFinished: true,
				})}\n\n`
			);
			clearInterval(intervalId);
			if (!res.writableEnded) {
				res.end();
			}
			if (jobState === "completed") {
				await job.remove();
			}
		} else {
			res.write(
				`event: jobStatus\ndata: ${JSON.stringify({
					status: message,
					progress,
				})}\n\n`
			);
		}
	}, 1000);
}
