// pages/api/start-job.js
import Queue, { Job } from "bull";
import { Request, Response } from "express";
import { getAudio, getAudioTransciption } from "../lib/steps";
import fs from "fs";
import { convertMp3ToWav } from "../utils/audioUtils";
// Setup the job queue
const videoProcessingQueue = new Queue("video processing");
const logProgress = (job: Job, message: string, progress: number) => {
	job.progress({ message, progress }); // report progress
};
videoProcessingQueue.process(async (job, done) => {
	const { redditAnswer, redditQuestion, voice, video } = job.data;

	try {
		//const tempaudiopath = "C:\Users\hidanz\AppData\Local\Temp\tempAudio.mp3"
		// Step 1: Generate audio from text
		logProgress(job, "Generating question audio from text", 0);
		const tempQuestionAudio = await getAudio(redditQuestion, voice);

		const tempQuestionAudioWav = await convertMp3ToWav(tempQuestionAudio);
		console.log("tempQuestionAudio", tempQuestionAudioWav);
		logProgress(job, "Getting transcription", 0.5);
		const tempQuestionTranscription = await getAudioTransciption(
			tempQuestionAudioWav
		);
		console.log("tempQuestionTranscription", tempQuestionTranscription);

		// logProgress(job, "Generating answer audio from text", 0.5);
		// const tempAnswerAudio = await getAudio(redditAnswer, voice);

		//deleting tempQuestionAudio
		// logProgress(job, "Deleting tempQuestionAudio", 50);
		// fs.unlink(tempQuestionAudio, (err) => {
		// 	if (err) {
		// 		done(err);
		// 		return;
		// 	}
		// });

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
