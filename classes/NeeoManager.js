"use strict";

require('../conf/Constants.js');

const Logger = SRV_DEPENDENCIES.logger;
const fetch = require('node-fetch');

class NeeoManager {

    constructor() {
        
    }

    async getAllRecipes() {
        var url = "http://"+CONFIG.neeo.brain_ip+":3000/"+CONFIG.neeo.api_version+"/api/Recipes";
        try {
            var response = await fetch(url);
            var recipes = await response.json();
            recipes.forEach(function(recipe, index) {
                var distantUrl = UTILS.formatDistantUrl(recipe.url.setPowerOn, "on");;
                recipes[index].url.distantSetPowerOn = distantUrl;
                var pattern = /[0-9]{8,}/;
                var regex = new RegExp(pattern, "g");
                var matches = distantUrl.match(regex);
                recipes[index].url.distantSetPowerOnId = matches[1];
                var distantUrl = UTILS.formatDistantUrl(recipe.url.setPowerOff, "off");
                recipes[index].url.distantSetPowerOff = distantUrl;
                var pattern = /[0-9]{8,}/;
                var regex = new RegExp(pattern, "g");
                var matches = distantUrl.match(regex);
                recipes[index].url.distantSetPowerOffId = matches[1];
            });
            var data = recipes;
        } catch (e) {
            Logger.err("something went wrong when getting recipes : "+e);
        }
        return data;
    }

    async getAllRooms() {
        var url = "http://"+CONFIG.neeo.brain_ip+":3000/"+CONFIG.neeo.api_version+"/projects/home/rooms";
        try {
            var response = await fetch(url);
            var roomsRaw = await response.json();
            var rooms = [];
            roomsRaw.forEach(function(room, index) {
                var roomDevices = room.devices;
                if (!(Object.keys(roomDevices).length === 0 && roomDevices.constructor === Object)) {
                    room.iconName = room.icon.split('.')[room.icon.split('.').length - 1 ];
                    Object.keys(roomDevices).forEach(function(deviceKey, index) {
                        var macros = roomDevices[deviceKey].macros;
                        Object.keys(macros).forEach(function(macroKey, index) {
                            var macro = macros[macroKey];
                            var distantUrl = UTILS.formatDistantButtonUrl(macro.roomKey, macro.deviceKey, macro.key);
                            room.devices[deviceKey].macros[macroKey].distantUrl = distantUrl;
                        });
                    });
                    rooms.push(room);
                }
            });
            var data = rooms;
        } catch (e) {
            Logger.err("something went wrong when getting rooms : "+e);
        }
        return data;
    }

    async getByUrl(myurl) {
        try {
            var response = await fetch(myurl);
            var result = await response.json();
            var data = result;
        } catch (e) {
            Logger.err("something went wrong when getting by url : "+e);
        }
        return data;
    }
}

module.exports = NeeoManager;
