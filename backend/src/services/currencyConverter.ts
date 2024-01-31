import axios from 'axios';
import fs from 'fs';
import path from 'path';

const cacheFilePath = path.join(__dirname, 'conversionRatesCache.json');

type ConversionRatesCache = {
    [key: string]: number;
};

let conversionRatesCache: ConversionRatesCache = {};

const isWithinLast24Hours = (date: string): boolean => {
  const currentDate = new Date();
  const donationDate = new Date(date);
  const diffInHours = Math.abs(currentDate.getTime() - donationDate.getTime()) / 36e5;
  return diffInHours <= 24;
};

const loadCache = async () => {
  try {
    if (fs.existsSync(cacheFilePath)) {
      const data = await fs.promises.readFile(cacheFilePath, 'utf8');
      conversionRatesCache = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading cache file:', error);
  }
};

const saveToCache = async () => {
  try {
    await fs.promises.writeFile(cacheFilePath, JSON.stringify(conversionRatesCache));
  } catch (error) {
    console.error('Error writing to cache file:', error);
  }
};

loadCache();

const API_KEY = process.env.CONVERTOR_API_KEY;

export const convertCurrency = async (amount: number, srcCurrency: string, date: string): Promise<number> => {
  const cacheKey = `${date}_${srcCurrency}_to_ILS`;

  if (conversionRatesCache[cacheKey]) {
      return amount * conversionRatesCache[cacheKey];
  }

  try {
      let url;
      if (isWithinLast24Hours(date)) {
          url = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}&base_currency=${srcCurrency}&currencies=ILS`;
      } else {
          url = `https://api.freecurrencyapi.com/v1/historical?apikey=${API_KEY}&date=${date}&base_currency=${srcCurrency}&currencies=ILS`;
      }
      const response = await axios.get(url);
      const rate = isWithinLast24Hours(date) ? response.data.data['ILS'] : response.data.data[date]['ILS'];
      
      conversionRatesCache[cacheKey] = rate; 
      saveToCache(); 
      return amount * rate;

  } catch (error) {
      console.error("Error fetching conversion rate: ", error);
      throw new Error("Failed to fetch conversion rate");
  }
};