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
        let api = this.api;
        return new Promise(function(resolve,reject){
            api.getStationsData(function(err, devices) {
                if (err !== null) return reject(err);
                resolve(devices);
            });
        });
        
    }
}

module.exports = NetatmoManager;
