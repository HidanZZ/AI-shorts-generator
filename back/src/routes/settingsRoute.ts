// routes/settingRoute.ts

import { Router } from "express";
import {
	addAsset,
	deleteAsset,
	getApiKey,
	getAssets,
	setApiKey,
} from "../controllers/settingsController";

const settingsRouter = Router();

settingsRouter.get("/settings/apikey", getApiKey);
settingsRouter.post("/settings/apikey", setApiKey);
settingsRouter.get("/settings/assets", getAssets);
settingsRouter.post("/settings/assets", addAsset);
settingsRouter.delete("/settings/assets/:id", deleteAsset);

export default settingsRouter;
