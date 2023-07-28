import { NextResponse } from "next/server";
import { assetsPath, AssetFile } from "../route";
import fs from "fs";

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	console.log(params);

	if (!id) {
		return NextResponse.json(
			{ message: "missing key ['id']" },
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

	// remove the asset
	const index = data.assets.findIndex((asset) => asset.id === parseInt(id));
	console.log(index);

	if (index !== -1) {
		data.assets.splice(index, 1);
	}

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
