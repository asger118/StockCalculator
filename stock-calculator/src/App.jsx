import React, { useState } from "react";
import "./styles.css";
import {
  calculateTotalProfit,
  calculateTotalInvested,
  calculateTotalProfitPercentage,
  fetchPriceData,
} from "./functions.js";

export default function App() {
  const [rows, setRows] = useState([{ ticker: "", quantity: "", date: "" }]);
  const [prices, setPrices] = useState([]); // To store the fetched prices
  const [portfolio, setPortfolio] = useState([]);

  // Get today's date in the format yyyy-mm-dd
  const today = new Date().toISOString().split("T")[0];

  const removeRow = () => {
    if (rows.length > 1) {
      setRows(rows.slice(0, -1));
    } else {
      alert("At least one row must remain");
    }
  };

  const addRow = () => {
    setRows([...rows, { ticker: "", quantity: "", date: "" }]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

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
              style={{ backgroundColor: "#var(--green)", marginRight: "15px" }}
            >
              Add row
            </button>
            <button
              onClick={removeRow}
              style={{ backgroundColor: "var(--red)" }}
            >
              Remove row
            </button>
            <button
              onClick={() => fetchPriceData(rows, setPrices, setPortfolio)}
              style={{ backgroundColor: "var(--blue)", marginLeft: "15px" }}
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
                      <td
                        style={{
                          color:
                            price.profit < 0 ? "var(--red)" : "var(--green)",
                        }}
                      >
                        {/* Display individual profit for each stock */}
                        {price.profit.toFixed(2)} /{" "}
                        {price.percentageProfit.toFixed(2)}%
                      </td>
                      <td>{price.currency}</td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      style={{
                        color:
                          calculateTotalProfit(prices) < 0
                            ? "var(--red)"
                            : "var(--green)",
                      }}
                    >
                      {(() => {
                        const totalProfit = calculateTotalProfit(prices);
                        const totalInvested = calculateTotalInvested(prices);
                        const totalProfitPercentage =
                          calculateTotalProfitPercentage(
                            totalProfit,
                            totalInvested
                          );

                        // Return total profit and percentage profit
                        return (
                          <>
                            {totalProfit.toFixed(2)} /{" "}
                            {totalProfitPercentage.toFixed(2)}%
                          </>
                        );
                      })()}
                    </td>
                    <td></td> {/* Placeholder for the second column */}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bottom-container">
        <h3>Portfolio</h3>
        <table>
          <thead>
            <tr>
              <td>Company</td>
              <td>Ticker</td>
              <td>Quantity</td>
              <td>Total</td>
              <td>Currency</td>
              <td>Close price</td>
              <td colSpan={2}>Change</td>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((stock, index) => (
              <tr key={index}>
                <td>{stock.shortName}</td>
                <td>{stock.symbol}</td>
                <td>{stock.quantity}</td>
                <td>{stock.total}</td>
                <td>{stock.currency}</td>
                <td>{stock.price}</td>
                <td
                  style={{
                    color: stock.change < 0 ? "var(--red)" : "var(--green)",
                  }}
                >
                  {stock.change.toFixed(2)}
                </td>
                <td
                  style={{
                    color:
                      stock.percentChange < 0 ? "var(--red)" : "var(--green)",
                  }}
                >
                  {stock.percentChange.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
