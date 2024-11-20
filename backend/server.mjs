import express from "express";
import cors from "cors";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

// Create __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Endpoint for graph data
app.get("/api/chart/:ticker", async (req, res) => {
  const { ticker } = req.params;
  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1d&interval=1m`
    );
    const data = response.data.chart.result[0];
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
