// index.ts
import express from "express";
import routes from "./routes";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
dotenv.config();

const app = express();
export const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use("/public", express.static(path.join(__dirname, "../public")));
console.log(path.join(__dirname, "../public"));

// Load your routes
app.use("/", routes);

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
