var jwt = require('jsonwebtoken');

if (process.argv.length < 3) {
    process.exit(1);
} 


console.log('application', process.argv[2]);

var payload =  {
    data: 'The Things Network HTTP integration for lora-apeldoorn',
    exp: Math.floor(Date.now() / 1000) + 365 * (24 * 60 * 60),
    application: process.argv[2]
};

var secret = process.argv[3]; //get from 'firebase functions:config:get app.secret'


var options = {
   algorithm: 'HS256',
   expiresIn: '1year',
   audience: 'The Things Network',
   issuer: 'Dennis Geurts',
   subject: 'lora apeldoorn'
};


var token = jwt.sign(payload, secret);
console.log(token);
console.log('claim', new Buffer(token.split(/\./)[1], 'base64').toString());



