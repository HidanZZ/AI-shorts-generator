import { Router } from "express";
import {
	addAsset,
	deleteAsset,
	getAssets,
} from "../controllers/assetsController";

const assetsRouter = Router();

assetsRouter.get("/assets", getAssets);
assetsRouter.post("/assets", addAsset);
assetsRouter.delete("/assets/:id", deleteAsset);

export default assetsRouter;
