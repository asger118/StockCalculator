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


export const fetchPriceData = async (rows) => {
    try {
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
                    profit: profit,
                    percentageProfit: percentageProfit,
                    currency: data.currency,
                    quantity: row.quantity,
                };
            })
        );

        return fetchedPrices;
    } catch (error) {
        console.error("Error fetching stock prices:", error);
        throw error; // Propagate the error to the caller
    }
};
