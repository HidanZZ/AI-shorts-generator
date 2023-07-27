import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({ message: "Hello World!" });
}

export async function POST(req: Request) {
	return NextResponse.json({ message: "ok" });
}
