"use strict";

const Logger = SRV_DEPENDENCIES.logger;
const srvManager = SRV_DEPENDENCIES.srvManager;

class LightController {

    constructor() { }

    async displayLights(req, res) {
        res.send('ok');
    }
}

module.exports = LightController;
