import express from 'express';
import { updateBoardItems } from '../controllers/tableUpdaterController';

const router = express.Router();

router.post('/tableupdater/:boardId', updateBoardItems);

export default router;
