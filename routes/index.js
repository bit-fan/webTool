var express = require('express');
var router = express.Router();
var func = require('../dbModule/util');
const sysConfig = require('../config').config();
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('home', {title: 'Express', ip: sysConfig.ip, port: sysConfig.port});
});

module.exports = router;
