// Function to calculate total profit
export const calculateTotalProfit = (prices) => {
    return prices.reduce((total, price) => total + price.profit, 0);
};

// Function to calculate total invested
export const calculateTotalInvested = (prices) => {
    return prices.reduce((total, price) => total + price.priceOnDate * price.quantity, 0);
};

// Function to calculate profit percentage
export const calculateTotalProfitPercentage = (totalProfit, totalInvested) => {
    return totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
};

// fetchStockData.js
export const fetchPriceData = async (rows, setPrices, setPortfolio) => {
    try {
        // Fetch prices for the entered rows
        const fetchedPrices = await Promise.all(
            rows.map(async (row) => {
                if (!row.ticker || !row.date) {
                    throw new Error("Ticker and date must be filled out.");
                }

                const response = await fetch(
                    `http://localhost:3000/api/stock/${row.ticker}/${row.date}`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch data for ${row.ticker}`);
                }

                const data = await response.json();
                const profit = (data.currentPrice - data.priceOnDate) * row.quantity;
                const percentageProfit =
                    (profit / (data.priceOnDate * row.quantity)) * 100;

                return {
                    ticker: row.ticker,
                    date: row.date,
                    priceOnDate: data.priceOnDate,
                    currentPrice: data.currentPrice,
                    profit,
                    percentageProfit,
                    currency: data.currency,
                    quantity: row.quantity
                };
            })
        );

        setPrices(fetchedPrices);

        // Fetch portfolio data
        const portfolioData = await Promise.all(
            rows.map(async (row) => {
                if (!row.ticker) {
                    throw new Error("Ticker must be filled out.");
                }

                const response = await fetch(`http://localhost:3000/api/stock/${row.ticker}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch data for ${row.ticker}`);
                }

                const stockData = await response.json();

                return {
                    ...stockData,
                    quantity: row.quantity,
                    total: (stockData.previousClose * row.quantity).toFixed(2),
                    price: stockData.previousClose
                };
            })
        );

        setPortfolio(portfolioData);
    } catch (error) {
        console.error("Error fetching stock data:", error);
        alert(error.message);
    }
};
