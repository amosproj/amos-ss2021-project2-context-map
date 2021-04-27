const express = require('express')
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();

// Set-up View Engine for displaying data
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

queryCypher('MATCH network = (dc:DataCenter {name:"DC1",location:"Iceland, Rekjavik"}) -[:CONTAINS]->(:Router) -[:ROUTES]->(:Interface) RETURN network');

app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;

function queryCypher(query) {
    const neo4j = require('neo4j-driver');

    const driver = neo4j.driver('bolt://34.237.218.15:7687', neo4j.auth.basic('neo4j', 'winch-stub-bases'));
    const session = driver.session();

    app.get('/', function (req, res) {
        session
            .run('\n' + query)
            .then(function (result) {
                let dispArr = [];
                result.records.forEach(function (record) {
                    // log to console if you want to
                    // console.log(record);
                    dispArr.push({
                        // specify content that gets displayed in view/index.ejs
                        location: record._fields[0].start.properties.location
                    });
                });
                res.render('index', {
                    identities: dispArr
                })
            })
            .catch(function (err) {
                console.log(err);
            });
    });
}
