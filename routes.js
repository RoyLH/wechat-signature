'use strict';
var express = require('express');
var router = express.Router();
var WX_SIGNATURE_CONFIG = require('./config');

router.post('/getSignature', function (req, res, next) {
    var config = WX_SIGNATURE_CONFIG;
    var url = 'http://' + req.headers.host + req.originalUrl;

    liveDao.getSignature(req, res, next, config, url);
});