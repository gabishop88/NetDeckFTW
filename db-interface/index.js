const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");

var db = mysql.createConnection({
    host: '34.72.77.48',
    user: 'root',
    password: 'min_effort',
    database: 'MTG'
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (require, response) => {
    const query = "SELECT COUNT(*) FROM `Users`";
    db.query(query, (err, result) => {
        response.send(result);
        console.log(result);
    })
});

app.get('/db/checkuser', (req, res) => {
    const q = "SELECT `UserName` FROM `Users` WHERE `UserName`=?";
    db.query(q, req.query.username, (err, result) => {
        console.log(result);
        res.send(result);
    })
});

app.listen(3002, () => {
    console.log("db connected on port 3002");
});