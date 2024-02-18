import { fetchDataFromBoard } from './services/mondayService';
import { processDonations, ProcessedData } from './services/dataProcessor';

export const runStartup = async () => {
    try {
        const boardId = parseInt(process.env.BOARD_ID || "0");
        console.log("Fetching Data from => BOARD_ID: " + boardId);
        if (isNaN(boardId)) {
            throw new Error("BOARD_ID is not defined or not a number");
        }

        const initialData = await fetchDataFromBoard(boardId);
        const processedData: ProcessedData = await processDonations(initialData);
        console.log("TotalILS: " + Math.round(processedData.totalILS).toLocaleString() + " ₪");
        
    } catch (error) {
        console.error("Error during startup:", error);
    }
};