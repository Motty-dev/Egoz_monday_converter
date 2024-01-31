import { Request, Response } from 'express';
import { getProcessedData } from '../shared/dataCache';


export const streamEvents = (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Establish SSE with the client

    console.log('Client connected for SSE');

    const processedData = getProcessedData();
    
    if (processedData) {
        res.write(`data: ${JSON.stringify(processedData)}\n\n`);
    } else {
        res.write('data: {"message": "Data is being processed, please wait"}\n\n');
    }

    const intervalId = setInterval(() => {
        res.write(': keep-alive\n\n');
    }, 30000);

    req.on('close', () => {
        console.log('Client disconnected from SSE');
        clearInterval(intervalId);
    });
};
