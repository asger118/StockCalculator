import express from "express";
import cors from "cors";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

// Create __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Endpoint to fetch stock data
app.get("/api/stock/:ticker", async (req, res) => {
  const { ticker } = req.params;

  try {
    const { data } = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`
    );

    const {
      chart: {
        result: [
          {
            meta: {
              regularMarketPrice,
              currency,
              previousClose,
              fullExchangeName,
              shortName,
              symbol,
            },
          },
        ],
      },
    } = data;

    const change = parseFloat((regularMarketPrice - previousClose).toFixed(2));
    const percentChange = parseFloat(
      ((change / previousClose) * 100).toFixed(2)
    );

    res.json({
      regularMarketPrice,
      previousClose,
      currency,
      fullExchangeName,
      change,
      percentChange,
      shortName,
      symbol,
    });
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ error: error.message || "Failed to fetch stock data" });
  }
});
app.get('/api/stock/:ticker/:date', async (req, res) => {
  const { ticker, date } = req.params;

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
      return res
        .status(404)
        .json({ error: 'No data found for the given ticker or range' });
    }

    const { timestamp, indicators, meta } = result[0];

    if (!timestamp || !indicators || !indicators.quote || !indicators.quote[0].close) {
      return res
        .status(500)
        .json({ error: 'Data format error: Missing timestamps or prices' });
    }

    const { close } = indicators.quote[0];

    // Find the exact match for the requested date
    const exactIndex = timestamp.findIndex((time) => {
      const adjustedTime = new Date(time * 1000).setUTCHours(0, 0, 0, 0);
      return adjustedTime === targetDate * 1000;
    });

    if (exactIndex === -1) {
      return res.status(404).json({
        error: 'No price data found for the specified date',
      });
    }

    const priceOnDate = close[exactIndex];
    const currentPrice = meta.regularMarketPrice;
    const actualDate = new Date(timestamp[exactIndex] * 1000)
      .toISOString()
      .split('T')[0];
    const currency = meta.currency; // Get the currency from the meta info

    // Calculate the profit and percentage profit
    const profit = (currentPrice - priceOnDate);
    const percentageProfit = ((profit / priceOnDate) * 100).toFixed(2);

    res.json({
      ticker,
      targetDate: date,
      actualDate,
      priceOnDate,
      currentPrice,
      profit,
      percentageProfit,
      currency,
    });
  } catch (error) {
    console.error('Error fetching stock data:', error.message, error.response?.data || '');
    res
      .status(error.response?.status || 500)
      .json({ error: error.message || 'Failed to fetch stock data' });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
