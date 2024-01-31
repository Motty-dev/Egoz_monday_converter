import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Flush the headers to establish SSE with the client

    // Send an initial event
    res.write('data: Connected\n\n');

    // broadcast updates using res.write
    // Example: res.write(`data: ${JSON.stringify(someData)}\n\n`);

    // Keep the connection open by sending a comment every 30 seconds
    const intervalId = setInterval(() => {
        res.write(': keep-alive\n\n');
    }, 30000);

    req.on('close', () => {
        console.log('Client disconnected from SSE');
        clearInterval(intervalId);
    });
});

export default router;