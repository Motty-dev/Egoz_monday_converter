import express from 'express';
import { streamEvents } from '../controllers/eventsController';

const router = express.Router();

router.get('/events', streamEvents);

export default router;