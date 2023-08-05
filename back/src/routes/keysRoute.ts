// routes/settingRoute.ts

import { Router } from "express";
import { addApiKey, getApiKeys } from "../controllers/keysController";

const keysRoute = Router();

keysRoute.get("/apikeys", getApiKeys);
keysRoute.post("/apikeys", addApiKey);

export default keysRoute;
