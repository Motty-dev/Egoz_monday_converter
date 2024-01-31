import express from 'express';
import { getProcessedData } from '../controllers/processedDataController';

const router = express.Router();

router.get('/processed-data', getProcessedData);

export default router;