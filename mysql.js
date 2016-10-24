"use strict"

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database: 'gongang'
});
if(process.env.PORT!=undefined){
    connection = mysql.createConnection({
        host     : '104.199.181.60',
        user     : 'root',
        password : null,
        database: 'gongang'
    });
}
connection.connect();

module.exports=connection;
