import { Router } from "express";
import { getJobStatus, startJob } from "../controllers/jobController";

const jobRouter = Router();
jobRouter.post("/job/generate", startJob);
jobRouter.get("/job/status/:jobId", getJobStatus);

export default jobRouter;
