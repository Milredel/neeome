"use strict";

require('../conf/Constants.js');

const Logger = SRV_DEPENDENCIES.logger;
const fetch = require('node-fetch');

class FreeboxManager {

    constructor() {
        
    }

    async getAllChannels() {
        var url = "http://mafreebox.freebox.fr/api/v3/tv/channels";
        try {
            var response = await fetch(url);
            var channels = await response.json();
            return channels.result;
        } catch(e) {
            Logger.err("something went wrong when getting all tv channels : ('"+e+"')");
            throw new Error("something went wrong when getting all tv channels : ('"+e+"')");
        }
    }

    async getChannelsFromConfig() {
        try {
            var channels = await this.getAllChannels();
            var channelsFromConfig = CONFIG.freebox.channels_for_program;

            var result = {};
            for (var channelNumber in channelsFromConfig) {
                for (var index in channels) {
                    var channel = channels[index];
                    if (channel['name'] == channelsFromConfig[channelNumber]) {
                        channel["number"] = channelNumber;
                        result[index] = channel;
                    }
                };
            };
            return result;
        } catch(e) {
            throw new Error("something went wrong when getting tv channels from config : ('"+e+"')")
        }
    }

    async getProgram(channelId, beginTime, endTime) {
        var result = {};

        if (typeof channelId !== 'string' && !(channelId instanceof String)) {
            throw new Error("channelId must be a string");
        }
        if (SRV_VARS.data.tvChannels[channelId] == undefined) {
            throw new Error("impossible to find channelId '"+channelId+"' in server data");
        }

        if (beginTime == undefined && endTime == undefined) {
            var date = new Date();
            var beginDate = date.setHours(date.getHours() - 4);
            var myBeginTime = ((new Date(beginDate)).getTime()/1000.0).toFixed(0);
            var date = new Date();
            var endDate = date.setHours(date.getHours() + 6);
            var endEpoch = ((new Date(endDate)).getTime()/1000.0).toFixed(0);
            var myEndTime = endEpoch;
            //var plop = new Date(endEpoch*1000);
            //console.log(plop.toLocaleString());
        }
        if (beginTime != undefined && endTime == undefined) {
            var date = new Date(beginTime*1000);
            var beginDate = date.setHours(date.getHours() - 4);
            var myBeginTime = ((new Date(beginDate)).getTime()/1000.0).toFixed(0);
            var date = new Date(beginTime*1000);
            var endDate = date.setHours(date.getHours() + 6);
            var endEpoch = ((new Date(endDate)).getTime()/1000.0).toFixed(0);
            var myEndTime = endEpoch;
        }

        if (beginTime == undefined && endTime != undefined) {
            throw new Error("endTime cannot defined while beginTime is not");
        }

        if (beginTime != undefined && endTime != undefined) {
            var myBeginTime = beginTime;
            var myEndTime = endTime;
        }
        
        if (myEndTime <= myBeginTime) {
            throw new Error("endTime cannot precede beginTime");
        }

        try {
            do {
                var url = "http://mafreebox.freebox.fr/api/v3/tv/epg/by_channel/"+channelId+"/"+myBeginTime;
                var response = await fetch(url);
                var res = await response.json();
                var progs = res.result;
                var orderedProgs = UTILS.sortObj(progs, function(a, b) {
                    return progs[a]['date'] - progs[b]['date'];
                });
                var lastProgForThisSession = this.getLastByDate(progs);
                myBeginTime = (lastProgForThisSession.next).split("_")[0];
                for (var prog in orderedProgs) {
                    result[prog] = orderedProgs[prog];
                }
            } while (myBeginTime <= myEndTime);
        } catch(e) {
            Logger.err("something went wrong when getting tv program : ('"+e+"')");
            throw new Error("something went wrong when getting tv program : ('"+e+"')");
        }
        return result;
    }

    getLastByDate(progs) {
        var result;
        var first = true;
        for (var i in progs) {
            var prog = progs[i];
            if (first) {
                result = prog;
                first = false;
            } else {
                if (prog.date > result.date) {
                    result = prog;
                }
            }
        }
        return result;
    }

    isKnownChannel(channelName) {
        for (var channelUuid in SRV_VARS.data.tvChannels) {
            if (channelUuid == channelName) {
                return true;
            }
        }
        return false;
    }

    async getProgramInfo(programId) {
        var url = "http://mafreebox.freebox.fr/api/v3/tv/epg/programs/"+programId;
        try {
            var response = await fetch(url);
            var programInfo = await response.json();
            return programInfo.result;
        } catch(e) {
            Logger.err("something went wrong when getting program info for '"+programId+"' : ('"+e+"')");
            throw new Error("something went wrong when getting program info for '"+programId+"' : ('"+e+"')");
        }
    }
}

module.exports = FreeboxManager;
