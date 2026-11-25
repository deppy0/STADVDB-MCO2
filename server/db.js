require('dotenv').config();

const mysql = require('mysql2/promise');
function makePool(port) {
    return mysql.createPool({
        host: process.env.NODE_HOST,
        port: Number(port),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 5000,
    });
}

const pools = {
    1: makePool(process.env.NODE1_PORT),
    2: makePool(process.env.NODE2_PORT),
    3: makePool(process.env.NODE3_PORT),
};
const current_node = Number(process.env.CURRENT_NODE) || 1;

module.exports = { pools, current_node };
