import Bottleneck from 'bottleneck';

export const COMPLEXITY_PER_OPERATION = 30010;
export const COMPLEXITY_BUDGET = 1000000;
export const MAX_OPERATIONS_PER_MINUTE = 40;

export const limiter = new Bottleneck({
  minTime: 1500,
  maxConcurrent: 1, 
  reservoir: MAX_OPERATIONS_PER_MINUTE, 
  reservoirRefreshAmount: MAX_OPERATIONS_PER_MINUTE,
  reservoirRefreshInterval: 60 * 1000, 
});

// calculate the remaining time until the end of the current minute
function timeUntilNextMinute(): number {
  const now = new Date();
  const nextMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0);
  return nextMinute.getTime() - now.getTime(); // Difference in milliseconds
}

// wait for the complexity budget to replenish
export const waitForComplexityBudgetReplenishment = async (remainingComplexity: number): Promise<number> => {
  if (remainingComplexity < COMPLEXITY_PER_OPERATION) {
    const waitTimeMs = timeUntilNextMinute();
    console.log(`Complexity budget exceeded. Waiting for ${waitTimeMs / 1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, waitTimeMs));
    return COMPLEXITY_BUDGET; // Reset remaining complexity to full budget
  }
  return remainingComplexity; // Return the current complexity if no wait is needed
};

