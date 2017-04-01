const url = require("url")
const querystring = require('querystring');

var p = url.parse("com/sds/asd?app=1&sn=222",true)
var q = querystring.parse("com/sds/asd?app=1&sn=222")
console.log(p.query.app);
console.log(q);