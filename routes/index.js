var express = require('express');
var router = express.Router();
var func = require('../dbModule/util')
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('home', {title: 'Express'});
});

module.exports = router;
