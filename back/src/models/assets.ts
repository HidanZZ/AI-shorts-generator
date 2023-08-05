import { Schema, Types, model } from "mongoose";

export interface IAsset {
	id: Types.ObjectId;
	name: string;
	url: string;
	downloadedPath?: string;
}

const schema = new Schema<IAsset>({
	name: { type: String, required: true },
	url: { type: String, required: true },
	downloadedPath: { type: String },
});

export const Asset = model<IAsset>("Asset", schema);
