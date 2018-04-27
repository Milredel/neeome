"use strict";

const Logger = SRV_DEPENDENCIES.logger;
const srvManager = SRV_DEPENDENCIES.srvManager;
const netatmoManager = SRV_DEPENDENCIES.netatmoManager;

class NetatmoController {

    constructor() { }

    async displayWeather(req, res) {
        var data = await netatmoManager.getStationData();
        console.log(data[0]);
        console.log(data[0].modules);
        const config = {moduleOutdoorId : CONFIG.netatmo.outdoormodule_id};
        res.render('weather', { data: data[0] , config: config});
    }

}

module.exports = NetatmoController;
