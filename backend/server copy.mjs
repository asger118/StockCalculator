import express from "express";
import cors from "cors";
import path from "path";
import socketio from "socket.io";
import axios from "axios";
import http from "http";
import { fileURLToPath } from "url";
import { addStock, getAllStock, getStockByTicker, updatePrice, deleteStockByTicker } from "./database/database.mjs"

// Create __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const ws = socketio(server);

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

ws.on("connection", (socket) => {

  // Handle the 'calculateProfit' event from the frontend
  socket.on("calculateProfit", (stockData) => {
    console.log("Received stock data:", stockData);

    // Perform profit calculation
    const calculatedStockData = calculateProfit(stockData);

    // Emit the calculated profit and profit percentage back to the client
    socket.emit("profitCalculated", calculatedStockData);
  });

})


// A simple function to calculate profit based on some mock data
async function calculateProfit(row) {

  try {
    // Call the function to get the stock price on the specified date
    const stockPriceOnDate = await getStockPriceOnDate(ticker, date);
  }
  catch (error) { console.error('Error:', error.message); }

  const stock = getStockByTicker(stockData.ticker);
  const totalInvested = row.quantity * stockPriceOnDate;
  const currentTotal = row.quantity * stock.regularMarketPrice;
  const profit = currentTotal - totalInvested;
  const profitPercentage = ((profit / totalInvested) * 100).toFixed(2);

  return {
    profit, profitPercentage
  };
}


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


async function getStockPriceOnDate(ticker, date) {
  try {
    // Convert the date into a timestamp
    const targetDate = new Date(date).setUTCHours(0, 0, 0, 0) / 1000;

    // Fetch data from Yahoo Finance
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5y`
    );

    const {
      chart: { result },
    } = response.data;

    if (!result || result.length === 0) {
      throw new Error('No data found for the given ticker or range');
    }

    const { timestamp, indicators } = result[0];

    if (!timestamp || !indicators || !indicators.quote || !indicators.quote[0].close) {
      throw new Error('Data format error: Missing timestamps or prices');
    }

    const { close } = indicators.quote[0];

    // Find the exact match for the requested date
    const exactIndex = timestamp.findIndex((time) => {
      const adjustedTime = new Date(time * 1000).setUTCHours(0, 0, 0, 0);
      return adjustedTime === targetDate * 1000;
    });

    if (exactIndex === -1) {
      throw new Error('No price data found for the specified date');
    }

    const priceOnDate = close[exactIndex];

    return {
      priceOnDate,
    };
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    throw new Error(error.message || 'Failed to fetch stock data');
  }
}
