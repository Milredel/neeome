"use strict";

require('../conf/Constants.js');

const Logger = SRV_DEPENDENCIES.logger;
const netatmo = require('netatmo');

class NetatmoManager {

    constructor() {
        let auth = {
          "client_id": CONFIG.netatmo.client_id,
          "client_secret": CONFIG.netatmo.client_secret,
          "username": CONFIG.netatmo.username,
          "password": CONFIG.netatmo.password
        };

        this.api = new netatmo(auth);
    }

    async getStationData() {
        return this.api.getStationsData(function(err, devices) {
                if (err) throw new Error(err);
                
                console.log(devices);
                return devices;
            });
    }
}

module.exports = NetatmoManager;
