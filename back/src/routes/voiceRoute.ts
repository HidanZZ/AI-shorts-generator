// routes/voiceRoutes.ts

import { Router } from "express";
import { getVoicesController } from "../controllers/voiceController";

const voiceRouter = Router();

voiceRouter.get("/voices", getVoicesController);

export default voiceRouter;
