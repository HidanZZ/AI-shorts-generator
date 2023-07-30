import ffmpeg from "fluent-ffmpeg";
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

export type Transcription = {
	start: string;
	end: string;
	speech: string;
};

export function improveTranscription(
	transcriptions: Transcription[],
	originalText: string
): Transcription[] {
	let originalTextWords = originalText.split(" ");
	let improvedTranscriptions: Transcription[] = [];
	let transcriptionIndex = 0;
	for (let word of originalTextWords) {
		let currentTranscriptionWord =
			transcriptions[transcriptionIndex].speech.trim();
		if (word.includes(currentTranscriptionWord)) {
			transcriptions[transcriptionIndex].speech = word;
			improvedTranscriptions.push(transcriptions[transcriptionIndex]);
			transcriptionIndex++;
		} else {
			let parts = word.split(currentTranscriptionWord);
			transcriptions[transcriptionIndex].speech = parts[0];
			improvedTranscriptions.push(transcriptions[transcriptionIndex]);
			let secondPartTranscription: Transcription = {
				...transcriptions[transcriptionIndex],
			};
			secondPartTranscription.speech = parts[1];
			improvedTranscriptions.push(secondPartTranscription);
			transcriptionIndex++;
		}
	}
	//remove object in array that have undefined speech
	improvedTranscriptions = improvedTranscriptions.filter(
		(transcription) => transcription.speech !== undefined
	);
	return improvedTranscriptions;
}
