import ProgressBar from 'progress';
import { fetchDataFromBoard, updateItemOnBoard } from './mondayService';
import { convertCurrency } from './currencyConverter';
import { COMPLEXITY_BUDGET, waitForComplexityBudgetReplenishment, limiter, COMPLEXITY_PER_OPERATION } from '../utils/rateLimitManager';

export const updateBoardItems = async (boardId: number): Promise<any> => { // Use appropriate return type
  let remainingComplexity = COMPLEXITY_BUDGET;
  const items = await fetchDataFromBoard(boardId);
  const bar = new ProgressBar('Updating items [:bar] :current/:total :percent :etas', {
    total: items.length,
    width: 40,
    renderThrottle: 1,
  });

  for (const item of items) {
    // Wait for complexity budget replenishment if needed
    remainingComplexity = await waitForComplexityBudgetReplenishment(remainingComplexity);

    await limiter.schedule(async () => {
      const { convertedAmount, rate } = await convertCurrency(item.amount, item.currency, item.date);
      await updateItemOnBoard(item.id, convertedAmount, rate, boardId)
        .then(() => {
          remainingComplexity -= COMPLEXITY_PER_OPERATION;
          bar.tick();
        })
        .catch(error => console.error(`Failed to update item ${item.id}: ${error}`));
    });
  }

  // Return some result if necessary
  return { updated: true };
};
