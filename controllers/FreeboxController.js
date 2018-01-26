"use strict";

const Logger = SRV_DEPENDENCIES.logger;
const srvManager = SRV_DEPENDENCIES.srvManager;
const freeboxManager = SRV_DEPENDENCIES.freeboxManager;

class FreeboxController {

    constructor() { }

    async displayTVGuide(req, res) {
        var linkHome = "/?token="+CONFIG.home.private_token;
        var linkRecipes = "/recipes?token="+CONFIG.home.private_token;
        var linkTVGuide = "/tv/guide?token="+CONFIG.home.private_token;

        var channels = SRV_VARS.data.tvChannels;
        
        const vars = {public_dns : CONFIG.home.public_dns, private_token : CONFIG.home.private_token, channels: channels};
        
        res.render('tvguide', { channels: channels, linkHome: linkHome, linkRecipes: linkRecipes, linkTVGuide: linkTVGuide, vars: vars});
    }

    async getProgramByChannels(req, res) {
        var channels = req.query.channels;
        var begin = req.query.begin;
        for (var channel of channels) {
            if (!freeboxManager.isKnownChannel(channel)) {
                const result = UTILS.formatReturn(RESULT_FORBIDDEN, "Unknown channel '"+channel+"'", true, {});
                return SRV_DEPENDENCIES.srvManager.manageResult(res, result);
            }
        }
        try {
            var myRes = {};
            for (var channel of channels) {
                var program = await freeboxManager.getProgram(channel, begin);
                myRes[channel] = program;
            }
            res.send(myRes);
        } catch (e) {
            const result = UTILS.formatReturn(RESULT_INTERNAL, "An error has occured when retrieving program for channels ('"+e+"')", true, {});
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
