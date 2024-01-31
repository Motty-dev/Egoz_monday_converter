import express from 'express';
import { fetchData } from '../controllers/fetchDataController';

const router = express.Router();

router.get('/fetch-data/:boardId', fetchData);

export default router;