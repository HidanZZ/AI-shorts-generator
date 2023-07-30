import { exec } from 'child_process';

// run this command edge-tts --text "{text}" --write-media {output_file}
export const textToSpeech = async (
  text: string,
  output_file: string,
  voice: string
) => {
  const command = `edge-tts --text "${text}" --write-media ./audios/${output_file}.mp3 --voice ${voice} --words-in-cue 1 --write-subtitles ./subtitles/${output_file}.vtt`;
  try {
    exec(command);
    return `${output_file}.mp3`;
  } catch (error) {
    console.log(error);
  }
};
