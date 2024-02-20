// // import { Request, Response } from 'express';
// // import { fetchDataFromBoard, updateItemOnBoard } from '../services/mondayService';
// // import { convertCurrency } from '../services/currencyConverter';
// // import ProgressBar from 'progress';

// // function delay(seconds: number) {
// //     return new Promise(resolve => setTimeout(resolve, seconds * 1000));
// // }

// // function extractResetTime(errorMessage: string): number {
// //     const resetTimeMatch = errorMessage.match(/reset in (\d+) seconds/);
// //     return resetTimeMatch ? parseInt(resetTimeMatch[1], 10) : 60;
// // }

// // export const updateBoardItems = async(req: Request, res: Response): Promise<void> => {
// //     try {
// //         const boardId = parseInt(req.params.boardId);
// //         if (isNaN(boardId)) {
// //             res.status(400).send("Invalid board ID");
// //             return;
// //         }

// //         const items = await fetchDataFromBoard(boardId);
// //         const bar = new ProgressBar("Updating items [:bar] :percent :etas", {
// //             total: items.length,
// //             width: 40,
// //         });

// //         for (const item of items) {
// //             let finalAmount = item.amount;
// //             let rate = 0;

// //             if (item.currency !== "ILS") {
// //                 const { convertedAmount, rate: conversionRate } = await convertCurrency(item.amount, item.currency, item.date);
// //                 finalAmount = parseFloat(convertedAmount.toFixed(2));
// //                 rate = parseFloat(conversionRate.toFixed(2));
// //             }

// //             try {
// //                 await updateItemOnBoard(item.id, finalAmount, rate, boardId);
// //             } catch (error) {
// //                 console.log(`Rate limit hit, retrying item ${item.id}...`);
// //                 await delay(17); // Wait for 17 seconds before retrying
// //                 await updateItemOnBoard(item.id, finalAmount, rate, boardId); // Retry update
// //             }

// //             bar.tick({ item: item.id }); // Update the progress bar
// //         }

// //         res.json({ success: true, message: "Board items updated successfully." });
// //     } catch (error) {
// //         console.error("Error updating board items:", error);
// //         res.status(500).send("Error updating board items");
// //     }
// // }

// import express, { Request, Response } from 'express';
// import ProgressBar from 'progress';
// import { fetchDataFromBoard, updateItemOnBoard } from '../services/mondayService';
// import { convertCurrency } from '../services/currencyConverter';

// // Utility function to delay execution
// function delay(seconds: number) {
//   return new Promise(resolve => setTimeout(resolve, seconds * 1000));
// }

// // Extract reset time from error message
// function extractResetTime(errorMessage: string): number {
//   const resetTimeMatch = errorMessage.match(/reset in (\d+) seconds/);
//   return resetTimeMatch ? parseInt(resetTimeMatch[1], 10) : 60; // Default to 60 seconds if not found
// }

// export async function updateBoardItems(req: Request, res: Response): Promise<void> {
//   const boardId = parseInt(req.params.boardId, 10);
//   if (isNaN(boardId)) {
//     res.status(400).send('Invalid board ID');
//     return;
//   }

//   try {
//     const items = await fetchDataFromBoard(boardId);
//     const bar = new ProgressBar('Updating items [:bar] :percent :etas', {
//       total: items.length,
//       width: 40,
//     });

//     for (const item of items) {
//       let retryAfter = 60; // Default wait time in seconds
//       do {
//         try {
//           const conversionResult = await convertCurrency(item.amount, item.currency, item.date);
//           const finalAmount = parseFloat(conversionResult.convertedAmount.toFixed(2));
//           const rate = parseFloat(conversionResult.rate.toFixed(2));

//           await updateItemOnBoard(item.id, finalAmount, rate, boardId);
//           bar.tick();
//           retryAfter = 0; // Reset retryAfter to exit the loop on successful update
//         } catch (error) {
//           if (error instanceof Error && error.message.includes('Complexity budget exhausted')) {
//             retryAfter = extractResetTime(error.message);
//             console.log(`Rate limit hit. Waiting for ${retryAfter} seconds...`);
//             bar.interrupt(`Rate limit hit. Waiting for ${retryAfter} seconds...`);
//             await delay(retryAfter + 1); // Adding a buffer of 1 second to ensure the limit has been reset
//           } else {
//             console.error(`Error updating item ${item.id}: ${error}`);
//             throw error; // Rethrow the error if it's not a rate limit issue
//           }
//         }
//       } while (retryAfter > 0);
//     }

//     res.json({ success: true, message: 'Board items updated successfully.' });
//   } catch (error) {
//     console.error("Error updating board items:", error);
//     res.status(500).send("Error updating board items");
//   }
// }
// import express, { Request, Response } from 'express';
// import ProgressBar from 'progress';
// import Bottleneck from 'bottleneck';
// import { fetchDataFromBoard, updateItemOnBoard } from '../services/mondayService';
// import { convertCurrency } from '../services/currencyConverter';

// // Initialize a new Bottleneck limiter
// const limiter = new Bottleneck({
//   minTime: 2500,
//   maxConcurrent: 1,
// });

// // Wrap the updateItemOnBoard function to control its execution rate
// const updateItemOnBoardLimited = limiter.wrap(updateItemOnBoard);

// export const updateBoardItems = async (req: Request, res: Response): Promise<void> => {
//   const boardId = parseInt(req.params.boardId, 10);
//   if (isNaN(boardId)) {
//     res.status(400).send('Invalid board ID');
//     return;
//   }

//   try {
//     const items = await fetchDataFromBoard(boardId);
//     const bar = new ProgressBar('Updating items [:bar] :percent :etas', {
//       total: items.length,
//       width: 40,
//     });

//     await Promise.all(items.map(async item => {
//       const { convertedAmount, rate } = await convertCurrency(item.amount, item.currency, item.date);
//       await updateItemOnBoardLimited(item.id, convertedAmount, rate, boardId)
//         .catch(error => {
//           console.error(`Failed to update item ${item.id}: ${error}`);
//           // Optionally, you can handle retries here if specific to updateItemOnBoard failures
//         });
//       bar.tick();
//     }));

//     res.json({ success: true, message: 'Board items updated successfully.' });
//   } catch (error) {
//     console.error("Error updating board items:", error);
//     res.status(500).send("Error updating board items");
//   }
// };

// import { Request, Response } from 'express';
// import ProgressBar from 'progress';
// import Bottleneck from 'bottleneck';
// import { fetchDataFromBoard, updateItemOnBoard } from '../services/mondayService';
// import { convertCurrency } from '../services/currencyConverter';

// // Constants for rate and complexity management
// const COMPLEXITY_PER_OPERATION = 30010; // Example complexity cost per operation
// const COMPLEXITY_BUDGET = 1000000; // Total complexity budget per minute
// const MAX_OPERATIONS_PER_MINUTE = 40; // Max operations based on rate limit

// // Initialize a new Bottleneck limiter for rate limiting
// const limiter = new Bottleneck({
//   minTime: 1500, // Ensures a gap of at least 1500ms between operations, to not exceed 40 ops/min
//   maxConcurrent: 1, // Only one operation at a time
//   reservoir: MAX_OPERATIONS_PER_MINUTE, // Maximum operations that can be executed in a rolling minute
//   reservoirRefreshAmount: MAX_OPERATIONS_PER_MINUTE,
//   reservoirRefreshInterval: 60 * 1000, // Refresh rate for the reservoir every minute
// });

// // Main function to update board items
// export const updateBoardItems = async (req: Request, res: Response): Promise<void> => {
//   const boardId = parseInt(req.params.boardId, 10);
//   if (isNaN(boardId)) {
//     res.status(400).send('Invalid board ID');
//     return;
//   }

//   try {
//     const items = await fetchDataFromBoard(boardId);
//     const bar = new ProgressBar('Updating items [:bar] :percent :etas', {
//       total: items.length,
//       width: 40,
//     });

//     let remainingComplexity = COMPLEXITY_BUDGET; // Track remaining complexity budget

//     for (const item of items) {
//       if (remainingComplexity < COMPLEXITY_PER_OPERATION) {
//         // If not enough complexity budget, wait until it's replenished
//         console.log('Complexity budget exceeded, waiting for replenishment...');
//         await limiter.schedule(() => new Promise(resolve => setTimeout(resolve, 60000))); // Wait for 1 minute (or until the budget resets)
//         remainingComplexity = COMPLEXITY_BUDGET; // Assume budget is replenished after waiting
//       }

//       await limiter.schedule(async () => {
//         const { convertedAmount, rate } = await convertCurrency(item.amount, item.currency, item.date);
//         await updateItemOnBoard(item.id, convertedAmount, rate, boardId)
//           .then(() => {
//             remainingComplexity -= COMPLEXITY_PER_OPERATION; // Deduct the operation cost from the budget
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

import { Request, Response } from 'express';
import ProgressBar from 'progress';
import { fetchDataFromBoard, updateItemOnBoard } from '../services/mondayService';
import { convertCurrency } from '../services/currencyConverter';
import { COMPLEXITY_BUDGET, COMPLEXITY_PER_OPERATION, limiter, waitForComplexityBudgetReplenishment } from '../utils/rateLimitManager';

export const updateBoardItems = async (req: Request, res: Response): Promise<void> => {
  const boardId = parseInt(req.params.boardId, 10);
  if (isNaN(boardId)) {
    res.status(400).send('Invalid board ID');
    return;
  }

  try {
    const items = await fetchDataFromBoard(boardId);
    const bar = new ProgressBar('Updating items [:bar] :current/:total :percent :etas', {
      total: items.length,
      width: 40,
      renderThrottle: 1,
    });

    let remainingComplexity = COMPLEXITY_BUDGET;

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

    res.json({ success: true, message: 'Board items updated successfully.' });
  } catch (error) {
    console.error("Error updating board items:", error);
    res.status(500).send("Error updating board items");
  }
};
