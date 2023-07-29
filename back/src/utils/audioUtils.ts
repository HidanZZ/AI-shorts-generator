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
