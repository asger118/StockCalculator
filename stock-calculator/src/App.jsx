import React, { useState } from "react";
import "./styles.css";

export default function App() {
  const [rows, setRows] = useState([{ ticker: "", quantity: "", date: "" }]);

  const addRow = () => {
    // Add a new empty row
    setRows([...rows, { ticker: "", quantity: "", date: "" }]);
  };

  // Remove the last row, ensuring at least one row remains
  const removeRow = () => {
    if (rows.length > 1) {
      setRows(rows.slice(0, -1)); // Remove the last row
    } else {
      alert("At least one row must remain");
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value; // Update the specific field in the row
    setRows(updatedRows);
  };

  return (
    <>
      <div className="table-container">
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
        <button
          onClick={addRow}
          style={{ backgroundColor: "#405cf5", marginRight: "15px" }}
        >
          Add row
        </button>
        <button onClick={removeRow} style={{ backgroundColor: "#e62144" }}>
          Remove row
        </button>
      </div>
      <div className="container"></div>
    </>
  );
}
