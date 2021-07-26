const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");

const { v4: uuidv4 } = require('uuid');;
// import { v4 as uuidv4 } from 'uuid';

var db = mysql.createConnection({
    host: '34.72.77.48',
    user: 'root',
    password: 'min_effort',
    database: 'MTG'
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/** ========== Test DB Connection ========== */

var test_err = '<h1>Please start SQL database.</h1>';
var test_success = '<h1>Database connected.</h1>';
app.get('/', (req, res) => {
    const query = "SELECT COUNT(*) AS count FROM `Users`";
    db.query(query, (err, result) => {
        console.log(err);
        if (err) res.send(test_err);
        else res.send(test_success);
    })
});

/** ========== Handle Login Queries ========== */

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

/** ========== Handle Queries for Cards/Decks ========== */

var cardsearch_err = [{DetailID: 123, CardName: 'Festive Elf', ManaCost: '4{G}{G}'}, {DetailID: 456, CardName: 'Santa\'s Helper', ManaCost: '4{G}{G}'}, {DetailID: 789, CardName: 'Gift Horse', ManaCost: '{1}{G}'}];
app.post('/db/cardsearch', (req, res) => {
    var q = 'SELECT DetailID, CardName, ManaCost FROM CardDetails ';
    if ('name' in req.body) {
        if (req.body.name == '') {
            q = "SELECT DetailID, CardName, ManaCost, COUNT(DetailID) AS num_cards FROM CardDetails NATURAL JOIN DeckContains WHERE type NOT LIKE '%Basic%' GROUP BY DetailID ORDER BY num_cards DESC ";
        } else {
            q = q.concat('WHERE CardName LIKE \'%' + req.body.name + '%\' ');
        }
    }
    q = q.concat('LIMIT 10');
    
    db.query(q, [], (err, result) => {
        if (err) res.send(cardsearch_err);
        else res.send(result);
    })
});

var getgroup_err = [{Name: 'E1', ID: "e1"}, {Name: 'E2', ID: 'e2'}];
app.get('/db/getgroups', (req, res) => {
    var type = req.query.type.substr(0, req.query.type.length - 1);
    var owner = req.query.owner;
    const q = `SELECT ${type}Name AS name, ${type}ID AS id, Description AS 'desc' FROM ${type}s WHERE Owner LIKE ?`;

    db.query(q, [owner], (err, result) => {
        if (err) res.send(getgroup_err.map(e => { return {name: e['Name'].replace(/E/gi, type), id: e["ID"], desc: ''} }));
        else res.send(result);
    })
});

app.get('/db/groupcards', (req, res) => {
    var id = req.query.id;
    var q = '';
    if (req.query.type == 'Decks') {
        q = "SELECT DetailID as id, Quantity AS qty, Location AS loc FROM DeckContains WHERE DeckID=?";
    } else if (req.query.type == 'Collections') {
        q = "SELECT CardID as id, Quantity AS qty, Foil AS foil FROM CollectionContains WHERE CollectionID=?";
    }
    db.query(q, [id], (err, result) => {
        if (err) res.send([]);
        else res.send(result);
    });
});

app.post('/db/updategroup', (req, res) => {
    var q = '';
    console.log("Updating a group.");
    if (req.query.type == "Decks") {
        let translator = {
            visibility: 'Visibility',
            format: 'Format',
            placing: 'Placing',
            name: 'DeckName',
            desc: 'Description'
        }
        q = "UPDATE IGNORE Decks SET ATTRIBUTES WHERE DeckID=?";
        var str = '';
        Object.keys(req.body).forEach(i => str = str.concat(translator[i], "='", req.body[i], "', "));
        q = q.replace('ATTRIBUTES', str.slice(0, -2));
        console.log(q, req.query.id);
        db.query(q, [req.query.id], (err, result) => {
            if (err) res.send("Update Failed");
            else res.send("Updated");
        });
    } else if (req.query.type == "Collections") {
        let translator = {
            visibility: 'Visibility',
            name: 'CollectionName',
            desc: 'Description'
        }
        q = "UPDATE IGNORE Collections SET ATTRIBUTES WHERE CollectionID='?'";
        var str = '';
        Object.keys(req.body).forEach(i => str = str.concat(translator[i], "='", req.body[i], "', "));
        q = q.replace('ATTRIBUTES', str.slice(0, -2));
        db.query(q, [req.query.id], (err, result) => {
            if (err) res.send("Update Failed");
            else res.send("Updated");
        });
    }
});

app.post('/db/addgroup', (req, res) => {
    let groupid = uuidv4();
    let type = req.body.type.slice(0, -1);
    const q = `INSERT INTO ${type}s (${type}ID, Owner) VALUES (?, ?)`;
    console.log('adding a new deck.');
    db.query(q, [groupid, req.body.owner], (err, result) => {
        console.log(err);
        if (err) res.send("Creation Failed");
        else {
            db.query(`SELECT ${type}ID AS id, ${type}Name AS name, Description AS 'desc' FROM ${type}s WHERE ${type}ID=?`, [groupid], (err, result) => {
                console.log(err);
                console.log(result);
                res.send(result);
            });
        }
    })
});

app.delete('/db/deletegroup/:groupid', (req, res) => {
    var id = req.params.groupid;
    var type = req.query.type.slice(0, -1);
    const q = `DELETE FROM ${type}s WHERE ${type}ID=?`;
    db.query(q, [id], (err, result) => {
        if (err) res.send("Could not delete");
        else res.send("Done");
    });
});

app.get('/db/getrecommendations/:detailID', (req, res) => {
    var id = req.params.detailID;
    var format = req.query.format;
    const q = "CALL recommend_cards(?, ?)";
    db.query(q, [id, format], (err, result) => {
        if (err) res.send([]);
        else res.send(result);
    });
});

/** ========== Start Server ========== */

app.listen(3002, () => {
    console.log("Server Started at http://localhost:3002");
});