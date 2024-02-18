import { convertCurrency } from './currencyConverter';
import { setProcessedData } from '../shared/dataCache';
import { ConversionResult } from './currencyConverter';


import Bottleneck from 'bottleneck';
import ProgressBar from 'progress';

const limiter = new Bottleneck({
  maxConcurrent: 1,  
  minTime: 1       
});

const limitedConvertCurrency = limiter.wrap(convertCurrency);

interface CurrencyTotals {
  [currency: string]: number;
}

export interface DonationItem {
  id: string;
  amount: number;
  currency: string;
  date: string;
}

export interface ProcessedData {
  totalILS: number;
  currencyTotals: CurrencyTotals;
  donations: DonationItem[];
}

export const processDonations = async (donations: DonationItem[]): Promise<ProcessedData> => {
  let totalILS = 0;
  const processedDonations: DonationItem[] = [];
  const currencyTotals: CurrencyTotals = {};

  const bar = new ProgressBar('Processing [:bar] :current/:total Donations', {
      total: donations.length,
      width: 50,
      incomplete: ' ',
  });

  for (const donation of donations) {
      try {
          let amountILS: number = donation.amount;
          if (donation.currency !== 'ILS') {
              amountILS = await limitedConvertCurrency(donation.amount, donation.currency, donation.date).then((res: ConversionResult): number => Number(res.convertedAmount.toFixed(2)));
          }
          totalILS += amountILS;
          currencyTotals[donation.currency] = (currencyTotals[donation.currency] || 0) + amountILS;
          processedDonations.push({ ...donation, amount: amountILS });
      } catch (error) {
          console.error(`Error processing donation ID ${donation.id}:`, error);
      }
      bar.tick();
  }
  const result: ProcessedData = {
    totalILS,
    currencyTotals,
    donations: processedDonations,
  };

  setProcessedData(result);
  return result;
};
