import { Request, Response } from 'express';
import { ProcessedData } from '../services/dataProcessor';

let processedDataCache: ProcessedData | null = null;

export const getProcessedData = (req: Request, res: Response) => {
    if (!processedDataCache) {
        return res.status(404).send('Data not processed yet');
    }
    res.json(processedDataCache);
};