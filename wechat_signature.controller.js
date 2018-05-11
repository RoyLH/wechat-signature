'use strict';

var signature = require('./wechat_signature.service');

module.exports = {
    getSignature: function (req, res, next, config, url) {
        signature.getSignature(config, url, function (error, result) {
            if (error) {
                return res.json({
                    status: -1,
                    message: error.message,
                    data: null
                });
            }
            return res.json({
                status: 1,
                message: 'Data acquisition success',
                data: result
            });
        });
    }
}