let express = require('express');
let router = express.Router();

router.get('/', function(req, res) {
    res.render('index', {
        title: 'Tic-Tac-Toe Online Game',
        url: req.protocol + '://' + req.get('host') + req.originalUrl
    });
});

router.get('/*', function(req, res) {
    res.render('index', {
        title: 'Tic-Tac-Toe Online Game',
        url: req.protocol + '://' + req.get('host') + req.originalUrl
    });
});

module.exports = router;
