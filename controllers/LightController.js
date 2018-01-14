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

    async updateState(req, res) {
        var lightId = req.params.id;
        var params = {id: lightId};
        if (req.body.on != undefined) {
            params['on'] = req.body.on;
        }
        var light = await hueLightManager.updateLight(params);
        
        res.send(light);
    }
}

module.exports = LightController;
