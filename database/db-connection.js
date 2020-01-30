var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Miracle@123',
    database: 'mydb',
    insecureAuth: true
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports =   connection

