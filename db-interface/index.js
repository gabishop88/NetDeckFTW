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

app.get('/', (req, res) => {
    const query = "SELECT COUNT(*) AS count FROM `Users`";
    db.query(query, (err, result) => {
        if (err) res.send('<h1>Please start SQL database.</h1>');
        else res.send('<h1>Database connected.</h1>');
    })
});

var checkuser_err = [];
app.get('/db/checkuser', (req, res) => {
    const q = "SELECT `UserName` FROM `Users` WHERE `UserName`=?";
    db.query(q, req.query.username, (err, result) => {
        if (err) res.send(checkuser_err);
        res.send(result.data);
    })
});

var pwdhash_err = 'No Password Found';
app.get('/db/getpwdhash', (req, res) => {
    const q = "SELECT PasswordHash FROM Users WHERE UserName=?";
    db.query(q, req.query.username, (err, result) => {
        if (err || result.length == 0) res.send(pwdhash_err);
        else res.send(result[0].PasswordHash);
    })
});

var adduser_err = '';
app.post('/db/adduser', (req, res) => {
    var username = req.body.username;
    var passwordHash = req.body.passwordHash;

    const q = "INSERT INTO `Users` (`UserName`, `PasswordHash`) VALUES (?, ?)";
    db.query(q, [username, passwordHash], (err, result) => {
        if (err) res.send(adduser_err);
        else res.send(username);
    });
});

var cardsearch_err = [{CardName: 'Festive Elf', ManaCost: '4{G}{G}'}, {CardName: 'Santa\'s Helper', ManaCost: '4{G}{G}'}, {CardName: 'Gift Horse', ManaCost: '{1}{G}'}];
app.post('/db/cardsearch', (req, res) => {
    var q = 'SELECT CardName, ManaCost FROM CardDetails ';
    if ('name' in req.body) {
        if (req.body.name == '') {
            q = "SELECT CardName, ManaCost, COUNT(DetailID) AS num_cards FROM CardDetails NATURAL JOIN DeckContains WHERE type NOT LIKE '%Basic%' GROUP BY DetailID ORDER BY num_cards DESC ";
        } else {
            q = q.concat('WHERE CardName LIKE \'%' + req.body.name + '%\' ');
        }
    }
    q = q.concat('LIMIT 10');
    
    db.query(q, [], (err, result) => {
        console.log(result);
        if (err) res.send(cardsearch_err);
        else res.send(result);
    })
});

app.get('/db/getdecks', (req, res) => {
    const q = "";
});

app.listen(3002, () => {
    console.log("Server Started at http://localhost:3002");
});