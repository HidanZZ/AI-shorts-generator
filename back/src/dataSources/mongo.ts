import { connect, connection } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const mongoose = {
	run: async () => {
		try {
			console.log(
				"[Mongoose] Connecting to MongoDB... url: ",
				process.env.MONGODB_URI
			);
			if (!process.env.MONGODB_URI)
				throw new Error("MONGODB_URI is not defined");
			const connection = await connect(process.env.MONGODB_URI);
			console.log("[Mongoose] Connected to MongoDB");
			return connection;
		} catch (error) {
			console.error("Mongoose connection error: ", error);
		}
	},

	stop: async () => {
		try {
			return await connection.destroy();
		} catch (error) {
			console.error(error);
		}
	},
};
