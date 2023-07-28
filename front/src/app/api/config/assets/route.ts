import { NextResponse } from "next/server";
import fs from "fs";

export const assetsPath = "./data/assets.json";

export type AssetFile = {
	assets: Asset[];
};

type Asset = {
	id: number;
	name: string;
	url: string;
};

export async function GET() {
	// Check if the file exists
	const assets = checkFileExists();
	console.log(assets);

	if (assets) {
		return NextResponse.json(assets);
	} else {
		return NextResponse.json({ message: "no assets found" }, { status: 404 });
	}
}

export const checkFileExists = () => {
	// Check if the file exists
	if (fs.existsSync(assetsPath)) {
		const data = fs.readFileSync(assetsPath, "utf8");
		return JSON.parse(data);
	} else {
		return false;
	}
};

export async function POST(req: Request) {
	const { name, url } = await req.json();
	if (!name) {
		return NextResponse.json(
			{ message: "missing key ['name']" },

			{ status: 400 }
		);
	}
	if (!url) {
		return NextResponse.json(
			{ message: "missing key ['url']" },

			{ status: 400 }
		);
	}
	if (!isUrlYoutube(url)) {
		return NextResponse.json(
			{ message: "url is not a youtube url" },
			{ status: 400 }
		);
	}

	let data: AssetFile = { assets: [] };

	// Check if the file exists
	if (fs.existsSync(assetsPath)) {
		// Read and parse existing data
		const rawData = fs.readFileSync(assetsPath, "utf8");
		data = JSON.parse(rawData);
	}

	// add the new asset
	const newId = data.assets.length + 1;
	data.assets.push({ id: newId, name, url });

	try {
		fs.writeFileSync(assetsPath, JSON.stringify(data), "utf8");
		return NextResponse.json({ message: "ok" });
	} catch (err) {
		console.log(err);
		return NextResponse.json(
			{ message: "error while saving asset" },
			{ status: 500 }
		);
	}
}

const isUrlYoutube = (url: string) => {
	const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
	return regex.test(url);
};
