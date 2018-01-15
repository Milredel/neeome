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
            var channelsFromConfig = CONFIG.freebox.channels_for_program

            var result = {};
            for (var channelName of channelsFromConfig) {
                for (var index in channels) {
                    var channel = channels[index];
                    if (channel['name'] == channelName) {
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
        var result;

        if (channelId == "all") {
            throw new Error("Not implemented yet");
        }

        if (channelId instanceof Array) {
            throw new Error("Not implemented yet");
        }

        if (typeof channelId === 'string' || channelId instanceof String) {
            if (SRV_VARS.data.tvChannels[channelId] == undefined) {
                throw new Error("impossible to find channelId '"+channelId+"' in server data");
            }
            if (beginTime == undefined) {
                beginTime = ((new Date()).getTime()/1000.0).toFixed(0);
            }
            if (endTime == undefined) {
                var date = new Date();
                var endDate = date.setDate(date.getDate() + 1);
                var endEpoch = ((new Date(endDate)).getTime()/1000.0).toFixed(0);
                endTime = endEpoch;
                //var plop = new Date(endEpoch*1000);
                //console.log(plop.toLocaleString());
            }
            if (endTime <= beginTime) {
                throw new Error("endTime cannot precede beginTime");
            }

            try {
                do {
                    var url = "http://mafreebox.freebox.fr/api/v3/tv/epg/by_channel/"+channelId+"/"+beginTime;
                    var response = await fetch(url);
                    var progs = await response.json();
                    var lastProgForThisSession = this.getLastByDate(progs.result);
                    beginTime = (lastProgForThisSession.next).split("_")[0];
                    console.log(lastProgForThisSession);
                } while (beginTime <= endTime);
            } catch(e) {
                Logger.err("something went wrong when getting tv program : ('"+e+"')");
                throw new Error("something went wrong when getting tv program : ('"+e+"')");
            }
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
}

module.exports = FreeboxManager;
