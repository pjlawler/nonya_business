const mysql = require('mysql2');

const db = mysql.createConnection(
    {
    host: 'localhost',
    user: 'root',
    password: 'BAngkok2017!!',
    database: 'nonya'
    },
    console.log('Connected to the nonya database.')
);

module.exports = db;