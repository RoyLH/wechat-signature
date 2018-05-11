'use strict';
const jsSHA = require('jssha');
const crypto = require('crypto');

let jsapi_ticket = "kgt8ON7yVITDhtdwci0qeZ-73cXTer8upwL8Ft6zTbkBmzPlkXp140WN7Px5wlk0IZUeS5Ftz_yIWCBlT1MsTg";
let nonceStr = "mDZFST7DIT9TeysX";
let timestamp = 1525956104;
let url =  "http://localhost:8888/view/live/50";

let str = 'jsapi_ticket=' + jsapi_ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url;

// "jssha": "^2.3.1"
let shaObj = new jsSHA('SHA-1', 'TEXT');
shaObj.update(str);
let signature = shaObj.getHash('HEX');
console.log(signature);
// 990ac389bb9eaf953695c8cb6fa18ea4f8a85a86

// "jssha": "^1.5.0"
// let shaObj = new jsSHA(str, 'TEXT');
// let signature = shaObj.getHash('SHA-1', 'HEX');
// console.log(signature);
// 990ac389bb9eaf953695c8cb6fa18ea4f8a85a86

// let signature1 = crypto.createHash('sha1').update(str).digest('hex');
// console.log(signature1);
// 990ac389bb9eaf953695c8cb6fa18ea4f8a85a86