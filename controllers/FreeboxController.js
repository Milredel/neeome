"use strict";

const Logger = SRV_DEPENDENCIES.logger;
const srvManager = SRV_DEPENDENCIES.srvManager;
const freeboxManager = SRV_DEPENDENCIES.freeboxManager;

class FreeboxController {

    constructor() { }

    async displayTVGuide(req, res) {
        var linkRecipes = "/recipes?token="+CONFIG.home.private_token;
        var linkTVGuide = "/tv/guide?token="+CONFIG.home.private_token;

        var channels = SRV_VARS.data.tvChannels;
        
        const vars = {private_token : CONFIG.home.private_token, channels: channels};
        
        res.render('tvguide', { channels: channels, linkRecipes: linkRecipes, linkTVGuide: linkTVGuide, vars: vars});
    }

    async getProgramByChannel(req, res) {
        var channel = req.params.channel;
        if (!freeboxManager.isKnownChannel(channel)) {
            const result = UTILS.formatReturn(RESULT_FORBIDDEN, "Unknown channel '"+channel+"'", true, {});
            return SRV_DEPENDENCIES.srvManager.manageResult(res, result);
        }
        try {
            var program = await freeboxManager.getProgram(channel);
            res.send(program);
        } catch (e) {
            const result = UTILS.formatReturn(RESULT_INTERNAL, "An error has occured when retrieving program for channel '"+channel+"' ('"+e+"')", true, {});
            return SRV_DEPENDENCIES.srvManager.manageResult(res, result);
        }
    }

    async getProgramInfo(req, res) {
        var programId = req.params.id;
        try {
            var programInfo = await freeboxManager.getProgramInfo(programId);
            res.render('tvprograminfo', { programInfo: programInfo });
        } catch (e) {
            const result = UTILS.formatReturn(RESULT_INTERNAL, "An error has occured when retrieving program info for program '"+programId+"' ('"+e+"')", true, {});
            return SRV_DEPENDENCIES.srvManager.manageResult(res, result);
        }
    }
}

module.exports = FreeboxController;
