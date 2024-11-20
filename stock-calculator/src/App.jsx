import React, { useState } from "react";
import "./styles.css";

export default function App() {
  const [rows, setRows] = useState([{ ticker: "", quantity: "", date: "" }]);
  const [prices, setPrices] = useState([]); // To store the fetched prices

  const addRow = () => {
    setRows([...rows, { ticker: "", quantity: "", date: "" }]);
  };

  const removeRow = () => {
    if (rows.length > 1) {
      setRows(rows.slice(0, -1));
    } else {
      alert("At least one row must remain");
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const fetchPriceData = async () => {
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

      setPrices(fetchedPrices); // Store the fetched prices in state
      console.log(fetchedPrices); // Log the prices for debugging
    } catch (error) {
      console.error("Error fetching stock prices:", error);
      alert(error.message);
    }
  };

  // Get today's date in the format yyyy-mm-dd
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <div className="header">
        <h1>Stock Calcualator</h1>
      </div>
      <div className="container">
        <div className="left-box">
          <table>
            <thead>
              <tr>
                <td>Ticker</td>
                <td>Quantity</td>
                <td>Purchase date</td>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      placeholder="Ticker"
                      value={row.ticker}
                      onChange={(e) =>
                        handleInputChange(index, "ticker", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Amount"
                      min="1"
                      value={row.quantity}
                      onChange={(e) =>
                        handleInputChange(index, "quantity", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      max={today}
                      value={row.date}
                      onChange={(e) =>
                        handleInputChange(index, "date", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="button-container">
            <button
              onClick={addRow}
              style={{ backgroundColor: "#405cf5", marginRight: "15px" }}
            >
              Add row
            </button>
            <button onClick={removeRow} style={{ backgroundColor: "#e62144" }}>
              Remove row
            </button>
            <button
              onClick={fetchPriceData}
              style={{ backgroundColor: "#28a745", marginLeft: "15px" }}
            >
              Get Prices
            </button>
          </div>
        </div>
        <div className="right-box">
          <table>
            <thead>
              <tr>
                <td>Profit</td>
                <td>Currency</td>
              </tr>
            </thead>
            <tbody>
              {prices.length > 0 && (
                <>
                  {prices.map((price, index) => (
                    <tr key={index}>
                      <td>
                        {/* Display individual profit for each stock */}
                        {price.profit.toFixed(2)} /{" "}
                        {price.percentageProfit.toFixed(2)}%
                      </td>
                      <td>{price.currency}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      {
                        // Calculate total profit and total invested once
                        (() => {
                          const totalProfit = prices.reduce(
                            (total, price) => total + price.profit,
                            0
                          );
                          const totalInvested = prices.reduce(
                            (total, price) =>
                              total + price.priceOnDate * price.quantity,
                            0
                          );

                          // Calculate profit percentage once
                          const totalProfitPercentage =
                            totalInvested > 0
                              ? (totalProfit / totalInvested) * 100
                              : 0;

                          // Return total profit and percentage profit
                          return (
                            <>
                              {totalProfit.toFixed(2)} /{" "}
                              {totalProfitPercentage.toFixed(2)}%
                            </>
                          );
                        })()
                      }
                    </td>
                    <td></td> {/* Placeholder for the second column */}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
