// index.ts
import express from "express";
import routes from "./routes";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Load your routes
app.use("/", routes);

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
