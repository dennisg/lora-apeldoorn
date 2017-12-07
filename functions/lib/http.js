/**
    this is the entrypoint fromr the (https) TTN integration
**/

var jwt = require('jsonwebtoken');
var pubsub = require('@google-cloud/pubsub')();

// Reference a topic that has been previously created.
var topicDevice = pubsub.topic('update-device-after-uplink-message');
var topicGateway = pubsub.topic('update-gateway-after-uplink-message');


var notFound = (res) => {
    return res.status(404).send("I Fart In Your General Direction!");
};


module.exports = (functions, admin, exports) => {

    var db = admin.database();
    var config = functions.config();
    var secret = config.app.secret; //use 'firebase functions:config:set app.secret=<secret>' to set it

    var uplinkMessage = functions.https.onRequest((req, res) => {

        // initial checks
        if (req.body === undefined || req.body.app_id === undefined || req.body.dev_id === undefined) {
            //not a valid TTN Uplink message, some very basic and required
            // parts are missing in the request
            return notFound(res);
        }

        var bearerToken = req.headers['authorization'];

        //check the JWT token
        if (!bearerToken) {
            return notFound(res);
        }

        var decoded = {};

        try {
            var accessToken = bearerToken.split(' ')[1];
            decoded = jwt.verify(accessToken, secret);
            console.log('jwt', decoded);
        } catch (e) {
            console.error(e);
            //invalid jwt
            return notFound(res);
        }

        //last check: the app_id should match the application in the claim
        if (req.body.app_id !== decoded.application) {
            //Jwt claim <-> application mismatch
            return notFound(res);
        }

        console.log('TTN Uplink message for:', req.body.app_id + ' - ' + req.body.dev_id);
        // Everything seems okay.

        // generic save
        var root = db.ref(req.body.app_id).child('devices');

        //specific application save
        if (req.body.payload_fields && req.body.payload_fields.type) {
            //preferred
            var ref1 = root.child(req.body.dev_id).child(req.body.payload_fields.type);
            ref1.update(req.body).then();

            if(req.body.hardware_serial) {
                var ref2 = root.child(req.body.hardware_serial).child(req.body.payload_fields.type);
                ref2.update(req.body).then();
            }
        }

        var device = {
            app_id: req.body.app_id,
            dev_id: req.body.dev_id,
            hardware_serial: req.body.hardware_serial,
            payload_fields: req.body.payload_fields,

            time: req.body.metadata.time,
        };


        // Publish a message to the device update topic.
        topicDevice.publish(device, function(err, id) {
            if (err) {
                console.log('Failed to publish to topic for device uplink messages', err);
            }
        });

        req.body.metadata.gateways.forEach(function(gateway) {
            gateway.time = req.body.metadata.time;

            topicGateway.publish(gateway, function(err, id) {
                if (err) {
                    console.log('Failed to publish to topic for gateway uplink messages', err);
                }
            });

        });

        res.status(200).send('Success: ' + req.body.dev_id);


    });

    exports.uplinkMessage = uplinkMessage;

    return {};


};
