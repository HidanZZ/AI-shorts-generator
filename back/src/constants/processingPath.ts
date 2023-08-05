import path from "path";
import os from "os";
import fs from "fs";

const temp = path.join(os.tmpdir(), "short-vid-gen");

//check if folder exists
if (!fs.existsSync(temp)) {
	fs.mkdirSync(temp);
}

export const tempDir = temp;
