var pubsub = require('@google-cloud/pubsub')();


module.exports = (functions, admin, exports) => {

    var db = admin.database();

    /**
     *  this function updates the device data
     */
    var updateDeviceAfterUplinkMessage = functions.pubsub.topic('update-device-after-uplink-message').onPublish(event => {

        var data = JSON.parse(new Buffer(event.data.data, 'base64').toString());
        console.log(data);

        var type = data.payload_fields.type;
        delete data.payload_fields.type;

        //store the time too
        data.payload_fields.time = data.time;
        var ref = db.ref(data.app_id).child('apps').child(type).child(data.dev_id);

        ref.update(data.payload_fields);
    });

    /**
     * this function updates the gateway data
     */
    var updateGatewayAfterUplinkMessage = functions.pubsub.topic('update-gateway-after-uplink-message').onPublish(event => {

        var data = JSON.parse(new Buffer(event.data.data, 'base64').toString());
        console.log(data);

        var ref = db.ref('gateways').child(data.gtw_id);
        ref.update(data);

    });


    exports.updateDeviceAfterUplinkMessage = updateDeviceAfterUplinkMessage;
    exports.updateGatewayAfterUplinkMessage = updateGatewayAfterUplinkMessage;

    return {};

};