import mondaySdk from "monday-sdk-js";
import ProgressBar from "progress";
import { DonationItem } from './dataProcessor';

const monday = mondaySdk();
const mondayApiKey = process.env.MONDAY_API_KEY;

if (!mondayApiKey) {
  throw new Error("MONDAY_API_KEY is not defined in the environment variables.");
}

monday.setToken(mondayApiKey);

interface ColumnValue {
  id: string;
  text: string;
}

interface Item {
  id: string;
  name: string;
  column_values: ColumnValue[];
}

interface ProcessedItem {
  id: string;
  amount: number;
  currency: string;
  date: string;
}

let allItems: ProcessedItem[] = [];

let cursor: string | null = null;
let totalItemsCount: number = 0;

const processItem = (item: Item): DonationItem => {
  const amountText = item.column_values.find((c: ColumnValue) => c.id === 'numbers')?.text;

  return {
    id: item.id,
    amount: amountText ? parseFloat(amountText) : 0,
    currency: item.column_values.find((c: ColumnValue) => c.id === 'status2')?.text || '',
    date: item.column_values.find((c: ColumnValue) => c.id === 'date')?.text || 'N/A',
  };
};

export const fetchDataFromBoard = async (boardId: number): Promise<DonationItem[]> => {
  try {
    // Fetch the first item to initialize the cursor and get the total count
    const firstResponse = await monday.api(`query {
      boards(ids: ${boardId}) {
        items_count
        items_page(limit: 1) {
          items {
            id
            name
            column_values(ids: ["numbers", "status2", "date"]) {
              id
              text
            }
          }
          cursor
        }
      }
    }`);

    if (!firstResponse || !firstResponse.data || !firstResponse.data.boards[0]) {
      throw new Error("Invalid response structure for first item fetch");
    }

    cursor = firstResponse.data.boards[0].items_page.cursor;
    totalItemsCount = firstResponse.data.boards[0].items_count;
    const firstItem = firstResponse.data.boards[0].items_page.items[0];
    allItems.push(processItem(firstItem));

    const bar = new ProgressBar("Fetching data from Monday [:bar] :current/:total", {
      total: totalItemsCount,
      width: 50,
      incomplete: '',
    });

    // Paginate through the rest of the items
    while (cursor) {
      const response = await monday.api(`query {
        next_items_page (limit: 100, cursor: "${cursor}") {
          cursor
          items {
            id
            name
            column_values(ids: ["numbers", "status2", "date"]) {
              id
              text
            }
          }
        }
      }`);

      if (!response || !response.data || !response.data.next_items_page) {
        throw new Error("Invalid response structure in pagination");
      }

      const itemsPage = response.data.next_items_page;
      allItems.push(...itemsPage.items.map(processItem));
      cursor = itemsPage.cursor;
      bar.tick(itemsPage.items.length);
    }

    return allItems;
  } catch (error) {
    console.error("Error fetching data from Monday:", error);
    throw new Error("Failed to fetch data from Monday.com");
  }
};

export const updateItemOnBoard = async (itemId: string, finalAmount: number, rate: number, boardId: number) => {


  const roundedFinalAmount = parseFloat(finalAmount.toFixed(2));
  const roundedFinalRate = parseFloat(rate.toFixed(2));

  const finalAmountColumnId = 'numbers53'; 
  const rateColumnId = 'numbers6'; 
  const columnValuesString = `"{\\"${finalAmountColumnId}\\": \\"${roundedFinalAmount}\\", \\"${rateColumnId}\\": \\"${roundedFinalRate}\\"}"`;


  const mutation = `
    mutation {
            change_multiple_column_values(board_id: ${boardId}, item_id: ${itemId}, column_values: ${columnValuesString}) {
                id
            }
        }
  `;
  
  try {
      const response = await monday.api(mutation);
      return response;
  } catch (error) {
      console.error("Error updating item on Monday.com:", error);
      throw new Error("Failed to update item on Monday.com");
  }
};