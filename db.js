var mysql = require('mysql'),
    pool = null
 exports.connect = function(){
     pool = mysql.createPool({
         host:'localhost',
         user: 'root',
         password: 'root',
         database: 'node_auth_jwt'
     })
 }

 exports.get = function(){
     return pool
 }