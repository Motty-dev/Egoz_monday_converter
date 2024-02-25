
import { Request, Response } from 'express';
import * as tableUpdaterService from '../services/tableUpdaterService';

export const updateBoardItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const boardId = parseInt(req.params.boardId, 10);
    if (isNaN(boardId)) {
      res.status(400).send('Invalid board ID');
      return
    }

    const result = await tableUpdaterService.updateBoardItems(boardId);
    res.json({ success: true, message: 'Board items updated successfully.', data: result });
  } catch (error) {
    console.error("Error updating board items:", error);
    res.status(500).send("Error updating board items");
  }
};



// import { Request, Response } from 'express';
// import ProgressBar from 'progress';
// import { fetchDataFromBoard, updateItemOnBoard } from '../services/mondayService';
// import { convertCurrency } from '../services/currencyConverter';
// import { COMPLEXITY_BUDGET, COMPLEXITY_PER_OPERATION, limiter, waitForComplexityBudgetReplenishment } from '../utils/rateLimitManager';

// export const updateBoardItems = async (req: Request, res: Response): Promise<void> => {
//   const boardId = parseInt(req.params.boardId, 10);
//   if (isNaN(boardId)) {
//     res.status(400).send('Invalid board ID');
//     return;
//   }

//   try {
//     const items = await fetchDataFromBoard(boardId);
//     const bar = new ProgressBar('Updating items [:bar] :current/:total :percent :etas', {
//       total: items.length,
//       width: 40,
//       renderThrottle: 1,
//     });

//     let remainingComplexity = COMPLEXITY_BUDGET;

//     for (const item of items) {
//       // Wait for complexity budget replenishment if needed
//       remainingComplexity = await waitForComplexityBudgetReplenishment(remainingComplexity);

//       await limiter.schedule(async () => {
//         const { convertedAmount, rate } = await convertCurrency(item.amount, item.currency, item.date);
//         await updateItemOnBoard(item.id, convertedAmount, rate, boardId)
//           .then(() => {
//             remainingComplexity -= COMPLEXITY_PER_OPERATION;
//             bar.tick();
//           })
//           .catch(error => console.error(`Failed to update item ${item.id}: ${error}`));
//       });
//     }

//     res.json({ success: true, message: 'Board items updated successfully.' });
//   } catch (error) {
//     console.error("Error updating board items:", error);
//     res.status(500).send("Error updating board items");
//   }
// };
