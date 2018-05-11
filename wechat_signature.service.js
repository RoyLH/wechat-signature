'use strict';

var url = require('url');
var crypto = require('crypto');
var request = require('request');
var async = require('async');
var BufferHelp = require('bufferhelper');
var iconv = require('iconv-lite');
var fs = require('fs');

var createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
};

// var raw = function (args) {
//     var keys = Object.keys(args);
//     keys = keys.sort()
//     var newArgs = {};
//     keys.forEach(function (key) {
//         newArgs[key.toLowerCase()] = args[key];
//     });

//     var string = '';
//     for (var k in newArgs) {
//         string += '&' + k + '=' + newArgs[k];
//     }
//     string = string.substr(1);
//     return string;
// };

// /**
//  * @synopsis 签名算法 
//  *
//  * @param jsapi_ticket 用于签名的 jsapi_ticket
//  * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
//  *
//  * @returns
//  */
// var sign = function (jsapi_ticket, url) {
//     var ret = {
//         jsapi_ticket: jsapi_ticket,
//         nonceStr: createNonceStr(),
//         timestamp: createTimestamp(),
//         url: url
//     };

//     var string = raw(ret),
//     var jsSHA = require('jssha');

//     // "jssha": "^1.5.0"
//     var shaObj = new jsSHA(string, 'TEXT');
//     ret.signature = shaObj.getHash('SHA-1', 'HEX');

//     // "jssha": "^2.3.1"
//     // var shaObj = new jsSHA('SHA-1', 'TEXT');
//     // shaObj.update(str);
//     // ret.signatur = shaObj.getHash('HEX');

//     return ret;
//     /*
//      * Return something like this
//      *{
//      *  jsapi_ticket: 'jsapi_ticket',
//      *  nonceStr: '82zklqj7ycoywrk',
//      *  timestamp: '1415171822',
//      *  url: 'http://example.com',
//      *  signature: '1316ed92e0827786cfda3ae355f33760c4f70c1f'
//      *}
//      */
// };




var getSignature = function (config, url, cb) {
    var getToken = function (callback) {
        var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appId=' + config.appId + '&secret=' + config.appSecret;

        request.get(tokenUrl, function (error, response, body) {
            if (error) {
                callback(error);
            } else {
                try {
                    var token = JSON.parse(body).access_token;
                    callback(null, token);
                } catch (e) {
                    callback(e);
                }
            }
        });
    };

    var getNewTicket = function (token, callback) {
        request.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token + '&type=jsapi', function (error, response, body) {
            if (error) {
                callback(error);
            } else {
                try {
                    var ticket = JSON.parse(body).ticket;
                    callback(null, ticket);
                } catch (e) {
                    // callback(e);
                }
            }
        });
    };
    async.waterfall([
        getToken,
        getNewTicket
    ], function (error, ticket) {
        if (error) {
            cb(error);
        } else {
            var signInfo = {
                jsapi_ticket: ticket,
                noncestr: createNonceStr(),
                timestamp: createTimestamp(),
                url: url
            };
            // 签名生成规则如下： 
            // 参与签名的字段包括： 1 有效的jsapi_ticket 2 noncestr（ 随机字符串）3 timestamp（ 时间戳）4 url（ 当前网页的URL， 不包含# 及其后面部分）
            // 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序 j n t u）后， 使用URL键值对的格式（ 即key1 = value1 & key2 = value2…） 拼接成字符串str
            // 这里需要注意的是所有参数名均为小写字符
            // 对该str作sha1加密 字段名和字段值都采用原始值 不进行URL 转义

            var str = 'jsapi_ticket=' + signInfo.ticket + '&noncestr=' + signInfo.noncestr + '&timestamp=' + signInfo.timestamp + '&url=' + signInfo.url;
            // 上面一行要是写的优雅一点 复用性高一点 完全可以抽象成一个方法 也就是上面的raw函数 故而上面一行就相当于
            // var str = raw(signInfo); 结果是一样的
            
            signInfo.signature = crypto.createHash('sha1').update(str).digest('hex');
            // 上面一行相当于jssha这个npm包的以下实现（注意：由于该包版本的变更 写法也略有不同 但结果 都是相同的）：
            // var jsSHA = require('jssha');

            // "jssha": "^2.3.1"
            // var shaObj = new jsSHA('SHA-1', 'TEXT');
            // shaObj.update(str);
            // signInfo.signature = shaObj.getHash('HEX');

            // "jssha": "^1.5.0"
            // var shaObj = new jsSHA(str, 'TEXT');
            // signInfo.signature = shaObj.getHash('SHA-1', 'HEX');


            // 其实以上128 - 149 行全部可以用以上的sign函数代替 即 sign(ticket, url);

            cb(null, {
                appId: config.appId,
                nonceStr: signInfo.noncestr,
                signature: signInfo.signature,
                timestamp: signInfo.timestamp,
                url: signInfo.url
            });
        }
    });
};

exports.getSignature = getSignature;