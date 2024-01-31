import express from 'express';
import { updateItem } from '../controllers/updateItemController';

const router = express.Router();

router.post('/update-item', updateItem);

export default router;