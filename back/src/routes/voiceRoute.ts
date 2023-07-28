// routes/voiceRoutes.ts
import express from 'express';
import { getVoicesController } from '../controllers/voiceController';

const voiceRoutes = express.Router();

voiceRoutes.get('/voices', getVoicesController);

export default voiceRoutes;
