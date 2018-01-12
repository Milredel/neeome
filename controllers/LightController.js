"use strict";

const Logger = SRV_DEPENDENCIES.logger;
const srvManager = SRV_DEPENDENCIES.srvManager;
const hueLightManager = SRV_DEPENDENCIES.hueLightManager;

class LightController {

    constructor() { }

    async displayLights(req, res) {
        var lights = await hueLightManager.getAllLights();

        res.render('lights', { lights: lights });
    }
}

module.exports = LightController;
