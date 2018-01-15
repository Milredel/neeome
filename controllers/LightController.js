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
        if (req.body.brightness != undefined) {
            params['brightness'] = req.body.brightness;
        }
        if (req.body['rgb[red]'] != undefined && req.body['rgb[green]'] != undefined && req.body['rgb[blue]'] != undefined) {
            params['xy'] = UTILS.rgb_to_cie(req.body['rgb[red]'], req.body['rgb[green]'], req.body['rgb[red]']);
        }
        try {
            var light = await hueLightManager.updateLight(params);
        } catch (e) {
            res.send('Error when updating light : ('+e+').');
        }
        
        res.send(light);
    }
}

module.exports = LightController;
