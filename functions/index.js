var functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


require('./lib/http.js')(functions, admin, exports);
require('./lib/pubsub.js')(functions, admin, exports);
require('./lib/firebase.js')(functions, admin, exports);


