// pages/api/start-job.js
import Queue, { Job } from "bull";
import { Request, Response } from "express";
import { RedditVideoProcessor } from "../lib/RedditVideoProcesseur";
import { EdgeTTSStrategy, ElevenLabsStrategy } from "../lib/AudioStrategies";
import { JobData } from "../types/data";
import { VideoTypes } from "../constants";
import { StoryVideoProcesseur } from "../lib/StoryVideoProcesseur";
// Setup the job queue
const videoProcessingQueue = new Queue("video processing");

videoProcessingQueue.process(async (job: Job<JobData>, done) => {
	let videoProcessor;
	console.log("[queue] videoType", job.data.videoType);

	switch (job.data.videoType) {
		case VideoTypes.ASKREDDIT:
			console.log("[queue] ASKREDDIT");

			videoProcessor = new RedditVideoProcessor(job, done);
			break;
		case VideoTypes.STORY:
			console.log("[queue] STORY");
			videoProcessor = new StoryVideoProcesseur(job, done);
			break;

		default:
			console.log("[queue] default");
			videoProcessor = new RedditVideoProcessor(job, done);
			break;
	}

	const audioStrategy = job.data.useElevenLabs
		? new ElevenLabsStrategy(videoProcessor)
		: new EdgeTTSStrategy(videoProcessor);
	videoProcessor.setAudioStrategy(audioStrategy);
	await videoProcessor.process();
});

export async function startJob(req: Request, res: Response) {
	const {
		redditQuestion,
		redditAnswer,
		voice,
		video,
		useElevenLabs,
		useRandomVideoTime,
		useAiGeneratedStory,
		isYoutube,
		videoType,
		story,
	}: JobData = await req.body;
	console.log("[controller] story", story);

	const job = await videoProcessingQueue.add({
		redditAnswer,
		redditQuestion,
		voice,
		video,
		useElevenLabs,
		useRandomVideoTime,
		useAiGeneratedStory,
		isYoutube,
		videoType,
		story,
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
			const result = await job.finished(); // Get the result of the job
			const videoUrl = result.videoUrl;
			res.write(
				`event: jobStatus\ndata: ${JSON.stringify({
					status: jobState,
					progress,
					isFinished: true,
					videoUrl,
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
