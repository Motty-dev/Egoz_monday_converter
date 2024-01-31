import { ProcessedData } from '../services/dataProcessor';

let processedData: ProcessedData | null = null;

export const setProcessedData = (data: ProcessedData) => {
  processedData = data;
};

export const getProcessedData = (): ProcessedData | null => {
  return processedData;
};