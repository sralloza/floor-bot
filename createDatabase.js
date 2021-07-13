const mysql = require("mysql");
const settings = require("./build/src/config").default;

console.log(settings);
const connection = mysql.createConnection({
  host: settings.orm.host,
  database: settings.orm.type,
  user: settings.orm.username,
  password: settings.orm.password,
});
connection.query(`CREATE DATABASE IF NOT EXISTS ${settings.orm.database}`);
connection.end();
