import sqlite3 from "sqlite3";

// Connect to db
const db = new sqlite3.Database("stock.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
});

// Create table
//const sql = `CREATE TABLE stocks (id INTEGER PRIMARY KEY, ticker TEXT UNIQUE, companyName TEXT, currency TEXT, fullExchangeName TEXT, regularMarketPrice REAL, change REAL, percentChange REAL)`;
//db.run(sql);

// Drop table
//const sql = `DROP TABLE stocks`;
//db.run(sql);

// Insert data into database
function addStock(ticker, companyName, currency, fullExchangeName, regularMarketPrice, change, percentChange, callback = () => { }) {
    const sql = `INSERT INTO stocks(ticker, companyName, currency, fullExchangeName, regularMarketPrice, change, percentChange) VALUES (?,?,?,?,?,?,?)`;
    db.run(sql, [ticker, companyName, currency, fullExchangeName, regularMarketPrice, change, percentChange], (err) => {
        if (err) return callback(err);
        callback(null);
    });
}

// Query all data
function getAllStock(callback = () => { }) {
    const sql = `SELECT * FROM stocks`;
    db.all(sql, [], (err, rows) => {
        if (err) return callback(err, null);
        callback(null, rows);
    });
}

// Query specific data
function getStockByTicker(ticker, callback = () => { }) {
    const sql = `SELECT * FROM stocks WHERE ticker = ?`;
    db.get(sql, [ticker], (err, row) => {
        if (err) return callback(err, null);
        callback(null, row);
    });
}

// Update data
function updatePrice(price, ticker, callback = () => { }) {
    const sql = `UPDATE stocks SET regularMarketPrice = ? WHERE ticker = ?`;
    db.run(sql, [price, ticker], (err) => {
        if (err) return callback(err);
        callback(null);
    });
}

// Delete data
function deleteStockByTicker(ticker, callback = () => { }) {
    const checkSql = `SELECT * FROM stocks WHERE ticker = ?`;

    // Check if the stock exists
    db.get(checkSql, [ticker], (err, row) => {
        if (err) {
            console.error("Error checking stock existence:", err.message);
            return callback(err);
        }

        // If stock does not exist, return error
        if (!row) {
            const error = new Error(`Stock with ticker ${ticker} does not exist.`);
            console.error(error.message);
            return callback(error);
        }

        // If stock exists, delete it
        const deleteSql = `DELETE FROM stocks WHERE ticker = ?`;
        db.run(deleteSql, [ticker], (err) => {
            if (err) {
                console.error(`Error deleting stock with ticker ${ticker}:`, err.message);
                return callback(err);
            }
            console.log(`Stock with ticker ${ticker} deleted successfully.`);
            callback(null); // Success
        });
    });
}

/*
// Add test stocks
addStock("AAPL", "Apple Inc.", "USD", "NasdaqGS", 228.93, 1.5, 0.7, (err) => {
    if (err) {
        console.error("Failed to add stock AAPL:", err.message);
    } else {
        console.log("Stock AAPL added successfully!");
    }
});

addStock("TSLA", "Tesla Inc.", "USD", "NasdaqGS", 250.75, -3.2, -1.25, (err) => {
    if (err) {
        console.error("Failed to add stock TSLA:", err.message);
    } else {
        console.log("Stock TSLA added successfully!");
    }
});

addStock("MSFT", "Microsoft Corporation", "USD", "NasdaqGS", 315.12, 2.4, 0.76, (err) => {
    if (err) {
        console.error("Failed to add stock MSFT:", err.message);
    } else {
        console.log("Stock MSFT added successfully!");
    }
});



getAllStock((err, rows) => {
    if (err) {
        console.error("Error retrieving all stocks:", err.message);
    } else {
        console.log("All stocks:", rows);
    }
});
*/

export { addStock, getAllStock, getStockByTicker, updatePrice, deleteStockByTicker };
