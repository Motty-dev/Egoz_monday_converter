import { Request, Response } from 'express';
import { fetchDataFromBoard, updateItemOnBoard } from '../services/mondayService';
import { convertCurrency } from '../services/currencyConverter';

export async function updateBoardItems(req: Request, res: Response) {
    
    try {
        const boardId = parseInt(req.params.boardId);
        if (isNaN(boardId)) {
            return res.status(400).send("Invalid board ID");
        }

        const items = await fetchDataFromBoard(boardId);
        for (const item of items) {
            console.log(`Processing item ${item.id}`);
            
            let finalAmount = item.amount;
            let rate = 0;

            if (item.currency !== 'ILS') {
                const {convertedAmount, rate: conversionRate} = await convertCurrency(item.amount, item.currency, item.date);
                finalAmount = parseFloat(convertedAmount.toFixed(2)); 
                rate = parseFloat(conversionRate.toFixed(2));
            }

            // Update the item on the board with the new finalAmount and rate
            const response = await updateItemOnBoard(item.id, finalAmount, rate, boardId);
            console.log(`Response from updating item ${item.id} on board ${boardId}: ${JSON.stringify(response)}`);
            console.log(`Updated item ${item.id} with final amount ${finalAmount} and rate ${rate}`);
            
        }

        res.json({ success: true, message: 'Board items updated successfully.' });
    } catch (error) {
        console.error('Error updating board items:', error);
        res.status(500).send('Error updating board items');
    }
}
