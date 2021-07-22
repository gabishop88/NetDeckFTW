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
    const query = "SELECT COUNT(*) AS count FROM `Users`";
    db.query(query, (err, result) => {
        response.send(result[0].count.toString());
    })
});

app.get('/db/checkuser', (req, res) => {
    const q = "SELECT `UserName` FROM `Users` WHERE `UserName`=?";
    db.query(q, req.query.username, (err, result) => {
        res.send(result);
    })
});

app.get('/db/getpwdhash', (req, res) => {
    const q = "SELECT PasswordHash FROM Users WHERE UserName=?";
    db.query(q, req.query.username, (err, result) => {
        res.send(result[0].PasswordHash)
    })
});

app.post('/db/adduser', (req, res) => {
    var username = req.body.username;
    var passwordHash = req.body.passwordHash;

    const q = "INSERT INTO `Users` (`UserName`, `PasswordHash`) VALUES (?, ?)";
    db.query(q, [username, passwordHash], (err, result) => {
        if (err) console.log(err);
        res.send(username);
    });
});

app.post('/db/cardsearch', (req, res) => {
    var q = 'SELECT CardName, ManaCost FROM CardDetails ';
    if ('name' in req.body) {
        q = q.concat('WHERE CardName LIKE \'%' + req.body.name + '%\' ');
    }
    q = q.concat('LIMIT 10');

    // console.log(q);
    db.query(q, [], (err, result) => {
        if (err) {
            console.log(err);
            res.send([]);
        } else {
            res.send(result);
        }
    })
});

app.listen(3002, () => {
    console.log("db connected on port 3002");
});