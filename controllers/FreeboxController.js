"use strict";

const Logger = SRV_DEPENDENCIES.logger;
const srvManager = SRV_DEPENDENCIES.srvManager;
const freeboxManager = SRV_DEPENDENCIES.freeboxManager;

class FreeboxController {

    constructor() { }

    async displayTVGuide(req, res) {
        var channels = SRV_VARS.data.tvChannels;
        
        res.render('tvguide', { channels: channels });
    }

}

module.exports = FreeboxController;
